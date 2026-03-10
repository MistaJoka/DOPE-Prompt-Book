export const PROMPTBOOK_CANONICAL_URL = "https://promptbook.andraewilliams.com";
export const PORTFOLIO_URL = "https://andraewilliams.com";
export const READ_ONLY_DEMO_BADGE_TEXT = "Public demo · read-only";
export const READ_ONLY_DEMO_MESSAGE =
  "Prompt library changes are disabled in this public demo.";
export const PROMPT_WRITES_DISABLED_CODE = "PROMPT_WRITES_DISABLED";

export type PromptWriteAction = "create" | "update" | "duplicate" | "archive";

export type PromptRuntimeConfig = {
  writeActionsEnabled: boolean;
  isReadOnlyDemo: boolean;
  demoBadgeText: string | null;
  writeDisabledMessage: string | null;
};

function isEnabledValue(value: string | undefined): boolean {
  return value === "1" || value === "true" || value === "enabled";
}

export function arePromptWritesEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const override = env.PROMPTBOOK_RUNTIME_WRITES?.trim().toLowerCase();

  if (override === "enabled") {
    return true;
  }

  if (override === "disabled") {
    return false;
  }

  return !(
    isEnabledValue(env.VERCEL?.trim().toLowerCase()) ||
    Boolean(env.VERCEL_ENV?.trim())
  );
}

export function getPromptRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env
): PromptRuntimeConfig {
  const writeActionsEnabled = arePromptWritesEnabled(env);

  return {
    writeActionsEnabled,
    isReadOnlyDemo: !writeActionsEnabled,
    demoBadgeText: writeActionsEnabled ? null : READ_ONLY_DEMO_BADGE_TEXT,
    writeDisabledMessage: writeActionsEnabled ? null : READ_ONLY_DEMO_MESSAGE
  };
}

export function getBlockedWritePayload(action: PromptWriteAction) {
  return {
    error: READ_ONLY_DEMO_MESSAGE,
    code: PROMPT_WRITES_DISABLED_CODE,
    action,
    writeActionsEnabled: false
  };
}
