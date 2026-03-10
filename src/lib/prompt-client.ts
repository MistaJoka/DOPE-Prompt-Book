import {
  PromptDefinition,
  PromptMutationInput
} from "@/types/prompt";

type ErrorPayload = {
  error?: string;
  code?: string;
  action?: string;
  writeActionsEnabled?: boolean;
};

export class PromptRequestError extends Error {
  statusCode: number;
  code?: string;
  action?: string;
  writeActionsEnabled?: boolean;

  constructor(message: string, statusCode: number, payload: ErrorPayload) {
    super(message);
    this.name = "PromptRequestError";
    this.statusCode = statusCode;
    this.code = payload.code;
    this.action = payload.action;
    this.writeActionsEnabled = payload.writeActionsEnabled;
  }
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const payload = (await response.json()) as T & ErrorPayload;

  if (!response.ok) {
    throw new PromptRequestError(payload.error ?? "Request failed", response.status, payload);
  }

  return payload;
}

export async function fetchPromptDefinitions(): Promise<PromptDefinition[]> {
  const payload = await requestJson<{ prompts: PromptDefinition[] }>("/api/prompts", {
    method: "GET"
  });

  return payload.prompts;
}

export async function createPrompt(
  input: PromptMutationInput
): Promise<PromptDefinition> {
  const payload = await requestJson<{ prompt: PromptDefinition }>("/api/prompts", {
    method: "POST",
    body: JSON.stringify(input)
  });

  return payload.prompt;
}

export async function updatePrompt(
  id: string,
  input: PromptMutationInput
): Promise<PromptDefinition> {
  const payload = await requestJson<{ prompt: PromptDefinition }>(`/api/prompts/${id}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });

  return payload.prompt;
}

export async function duplicatePrompt(id: string): Promise<PromptDefinition> {
  const payload = await requestJson<{ prompt: PromptDefinition }>(
    `/api/prompts/${id}/duplicate`,
    {
      method: "POST",
      body: JSON.stringify({})
    }
  );

  return payload.prompt;
}

export async function archivePrompt(id: string): Promise<PromptDefinition> {
  const payload = await requestJson<{ prompt: PromptDefinition }>(
    `/api/prompts/${id}/archive`,
    {
      method: "POST",
      body: JSON.stringify({})
    }
  );

  return payload.prompt;
}
