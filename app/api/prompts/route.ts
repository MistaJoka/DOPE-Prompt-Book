import { NextResponse } from "next/server";

import {
  createPromptDefinition,
  listPromptDefinitions,
  PromptRepositoryError
} from "@/lib/prompt-repository";
import { arePromptWritesEnabled, getBlockedWritePayload } from "@/lib/prompt-runtime";
import { validatePromptCreateInput } from "@/lib/prompt-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PromptRepositoryError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  try {
    const prompts = await listPromptDefinitions();
    return NextResponse.json({ prompts });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    if (!arePromptWritesEnabled()) {
      return NextResponse.json(getBlockedWritePayload("create"), { status: 403 });
    }

    const payload = validatePromptCreateInput(await request.json());
    const prompt = await createPromptDefinition(payload);

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
