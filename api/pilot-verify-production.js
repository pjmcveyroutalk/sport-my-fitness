const crypto = require("node:crypto");

function safeEqual(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function validSha(value) {
  return /^[a-f0-9]{40}$/i.test(value || "");
}

function observedRevision() {
  const candidates = [
    process.env.PILOT_DEPLOYED_SHA,
    process.env.VERCEL_GIT_COMMIT_SHA,
    process.env.GITHUB_SHA,
  ];
  return candidates.find(validSha) || null;
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
    return response.status(405).json({
      error: "Method not allowed",
      request_id: requestId,
    });
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
    return response.status(401).json({
      error: "Unauthorized",
      request_id: requestId,
    });
  }

  const expectedValue = Array.isArray(request.query.expected_revision)
    ? request.query.expected_revision[0]
    : request.query.expected_revision;
  const expectedRevision =
    typeof expectedValue === "string" ? expectedValue : "";

  if (!validSha(expectedRevision)) {
    return response.status(400).json({
      error: "Invalid expected_revision",
      request_id: requestId,
    });
  }

  const observed = observedRevision();
  const revisionMatch = Boolean(
    observed &&
    observed.toLowerCase() === expectedRevision.toLowerCase()
  );

  const ready = revisionMatch;

  return response.status(ready ? 200 : 503).json({
    state: ready ? "READY" : "WAITING_FOR_REVISION",
    expected_revision: expectedRevision,
    observed_revision: observed,
    revision_match: revisionMatch,
    health_ready: true,
    verified_at: new Date().toISOString(),
    request_id: requestId,
  });
};

module.exports._test = {
  observedRevision,
  safeEqual,
  validSha,
};
