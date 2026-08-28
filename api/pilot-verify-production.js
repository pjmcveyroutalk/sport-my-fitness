const crypto = require("node:crypto");

function safeEqual(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function validSha(value) {
  return /^[a-f0-9]{40}$/i.test(value || "");
}

function forwardedValue(value) {
  if (typeof value !== "string") return "";
  return value.split(",")[0].trim();
}

function resolveOrigin(request) {
  const forwardedHost = forwardedValue(request.headers["x-forwarded-host"]);
  const host = forwardedHost || forwardedValue(request.headers.host);
  const forwardedProto = forwardedValue(request.headers["x-forwarded-proto"]);
  const protocol = forwardedProto === "http" ? "http" : "https";

  if (!host || !/^[A-Za-z0-9.-]+(?::\d{1,5})?$/.test(host)) return null;
  return `${protocol}://${host}`;
}

function observedRevision() {
  const revision = process.env.VERCEL_GIT_COMMIT_SHA || "";
  return validSha(revision) ? revision : null;
}

function setSecurityHeaders(response, requestId) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("X-Pilot-Request-Id", requestId);
}

module.exports = async function handler(request, response) {
  const requestId = crypto.randomUUID();
  setSecurityHeaders(response, requestId);

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed", request_id: requestId });
  }

  const verifierSecret = process.env.PILOT_PRODUCTION_VERIFY_SECRET;
  if (!verifierSecret) {
    return response.status(503).json({
      error: "Production verification is not configured",
      request_id: requestId,
    });
  }

  const authorization = request.headers.authorization || "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!safeEqual(suppliedSecret, verifierSecret)) {
    return response.status(401).json({ error: "Unauthorized", request_id: requestId });
  }

  const expectedValue = Array.isArray(request.query.expected_revision)
    ? request.query.expected_revision[0]
    : request.query.expected_revision;
  const expectedRevision = typeof expectedValue === "string" ? expectedValue : "";

  if (!validSha(expectedRevision)) {
    return response.status(400).json({
      error: "Invalid expected_revision",
      request_id: requestId,
    });
  }

  const origin = resolveOrigin(request);
  if (!origin) {
    return response.status(400).json({
      error: "Verification origin is invalid",
      request_id: requestId,
    });
  }

  const observed = observedRevision();
  const revisionMatch = Boolean(
    observed && observed.toLowerCase() === expectedRevision.toLowerCase()
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const result = await fetch(new URL("/", origin), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });
    const body = await result.text();
    const healthReady =
      result.ok &&
      body.includes("Sport My Fitness") &&
      body.includes("<title>");

    const ready = healthReady && revisionMatch;

    return response.status(ready ? 200 : 503).json({
      state: ready
        ? "READY"
        : healthReady
          ? "WAITING_FOR_REVISION"
          : "FAILED",
      expected_revision: expectedRevision,
      observed_revision: observed,
      revision_match: revisionMatch,
      health_ready: healthReady,
      verified_at: new Date().toISOString(),
      request_id: requestId,
    });
  } catch (error) {
    return response.status(504).json({
      state: "FAILED",
      expected_revision: expectedRevision,
      observed_revision: observed,
      revision_match: false,
      health_ready: false,
      error:
        error?.name === "AbortError"
          ? "Verification timed out"
          : "Verification request failed",
      request_id: requestId,
    });
  } finally {
    clearTimeout(timeout);
  }
};

module.exports._test = {
  forwardedValue,
  observedRevision,
  resolveOrigin,
  safeEqual,
  validSha,
};
