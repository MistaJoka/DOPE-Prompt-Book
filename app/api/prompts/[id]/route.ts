import { NextResponse } from "next/server";

import { validatePromptMutationInput } from "@/lib/prompt-files";
import {
  PromptRepositoryError,
  updatePromptDefinition
} from "@/lib/prompt-repository";
import { arePromptWritesEnabled, getBlockedWritePayload } from "@/lib/prompt-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PromptRepositoryError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!arePromptWritesEnabled()) {
      return NextResponse.json(getBlockedWritePayload("update"), { status: 403 });
    }

    const { id } = await context.params;
    const payload = validatePromptMutationInput(await request.json());
    const prompt = await updatePromptDefinition(id, payload);

    return NextResponse.json({ prompt });
  } catch (error) {
    return errorResponse(error);
  }
}
