import { NextResponse } from "next/server";

import {
  archivePromptDefinition,
  PromptRepositoryError
} from "@/lib/prompt-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof PromptRepositoryError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const prompt = await archivePromptDefinition(id);

    return NextResponse.json({ prompt });
  } catch (error) {
    return errorResponse(error);
  }
}
