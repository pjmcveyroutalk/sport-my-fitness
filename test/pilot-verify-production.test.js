const assert = require("node:assert/strict");
const verifier = require("../api/pilot-verify-production")._test;

assert.equal(verifier.validSha("a".repeat(40)), true);
assert.equal(verifier.validSha("abc"), false);

const previous = process.env.VERCEL_GIT_COMMIT_SHA;
process.env.VERCEL_GIT_COMMIT_SHA = "b".repeat(40);
assert.equal(verifier.observedRevision(), "b".repeat(40));
process.env.VERCEL_GIT_COMMIT_SHA = "not-a-sha";
assert.equal(verifier.observedRevision(), null);
if (previous == null) delete process.env.VERCEL_GIT_COMMIT_SHA;
else process.env.VERCEL_GIT_COMMIT_SHA = previous;

assert.equal(
  verifier.resolveOrigin({
    headers: {
      "x-forwarded-host": "sport-my-fitness.vercel.app",
      "x-forwarded-proto": "https",
    },
  }),
  "https://sport-my-fitness.vercel.app",
);

console.log("external production verifier tests passed");
