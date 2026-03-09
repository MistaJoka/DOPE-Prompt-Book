import {
  PromptDefinition,
  PromptMutationInput
} from "@/types/prompt";

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
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
