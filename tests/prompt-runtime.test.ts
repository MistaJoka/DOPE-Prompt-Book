import assert from "node:assert/strict";
import test from "node:test";

import {
  arePromptWritesEnabled,
  getBlockedWritePayload,
  getPromptRuntimeConfig,
  PROMPT_WRITES_DISABLED_CODE,
  READ_ONLY_DEMO_BADGE_TEXT,
  READ_ONLY_DEMO_MESSAGE
} from "../src/lib/prompt-runtime";

function env(overrides: Partial<NodeJS.ProcessEnv> = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    ...overrides
  };
}

test("prompt writes stay enabled outside Vercel by default", () => {
  assert.equal(arePromptWritesEnabled(env()), true);
  assert.deepEqual(getPromptRuntimeConfig(env()), {
    writeActionsEnabled: true,
    isReadOnlyDemo: false,
    demoBadgeText: null,
    writeDisabledMessage: null
  });
});

test("prompt writes are disabled on Vercel unless explicitly overridden", () => {
  assert.equal(arePromptWritesEnabled(env({ VERCEL: "1" })), false);
  assert.equal(arePromptWritesEnabled(env({ VERCEL_ENV: "production" })), false);
  assert.equal(
    arePromptWritesEnabled(env({
      VERCEL: "1",
      PROMPTBOOK_RUNTIME_WRITES: "enabled"
    })),
    true
  );
  assert.equal(
    arePromptWritesEnabled(env({
      PROMPTBOOK_RUNTIME_WRITES: "disabled"
    })),
    false
  );
});

test("blocked write payload is structured for API consumers", () => {
  assert.deepEqual(getPromptRuntimeConfig(env({ VERCEL: "1" })), {
    writeActionsEnabled: false,
    isReadOnlyDemo: true,
    demoBadgeText: READ_ONLY_DEMO_BADGE_TEXT,
    writeDisabledMessage: READ_ONLY_DEMO_MESSAGE
  });
  assert.deepEqual(getBlockedWritePayload("duplicate"), {
    error: READ_ONLY_DEMO_MESSAGE,
    code: PROMPT_WRITES_DISABLED_CODE,
    action: "duplicate",
    writeActionsEnabled: false
  });
});
