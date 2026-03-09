import { NextResponse } from "next/server";

import {
  createPromptDefinition,
  listPromptDefinitions,
  PromptRepositoryError
} from "@/lib/prompt-repository";
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
    const payload = validatePromptCreateInput(await request.json());
    const prompt = await createPromptDefinition(payload);

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
