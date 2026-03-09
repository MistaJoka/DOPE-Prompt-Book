import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { serializePromptFile } from "../src/lib/prompt-files";
import {
  archivePromptDefinition,
  createPromptDefinition,
  duplicatePromptDefinition,
  listPromptDefinitions,
  PromptRepositoryError,
  updatePromptDefinition
} from "../src/lib/prompt-repository";
import { PromptDefinition, PromptMutationInput } from "../src/types/prompt";

function makeMutationInput(overrides: Partial<PromptMutationInput> = {}): PromptMutationInput {
  return {
    title: "Customer Interview Summary",
    summary: "Extract signal from interview notes.",
    body: "Summarize {{transcript}} into 5 bullets.",
    tags: ["research", "customer"],
    collection: "Discovery",
    variables: ["transcript"],
    outputType: "markdown",
    preferredModel: "gpt-4o",
    favorite: false,
    status: "active",
    category: "recipe",
    ...overrides
  };
}

async function createTempPromptsRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "dope-prompts-"));
  return path.join(root, "prompts");
}

test("prompt repository mutations persist to disk and survive reloads", async () => {
  const promptsRoot = await createTempPromptsRoot();
  const created = await createPromptDefinition(makeMutationInput(), promptsRoot);

  assert.match(created.id, /^recipe-/);

  const updated = await updatePromptDefinition(
    created.id,
    makeMutationInput({
      title: "Customer Interview Insight Extractor",
      favorite: true
    }),
    promptsRoot
  );
  const duplicated = await duplicatePromptDefinition(created.id, promptsRoot);
  await archivePromptDefinition(created.id, promptsRoot);

  const prompts = await listPromptDefinitions(promptsRoot);
  const archived = prompts.find((prompt) => prompt.id === created.id);
  const duplicate = prompts.find((prompt) => prompt.id === duplicated.id);

  assert.equal(prompts.length, 2);
  assert.equal(updated.title, "Customer Interview Insight Extractor");
  assert.equal(archived?.status, "archived");
  assert.equal(duplicate?.status, "draft");
  assert.equal(duplicate?.favorite, false);
  assert.match(duplicate?.title ?? "", /Copy$/);
});

test("listPromptDefinitions rejects duplicate ids and slugs", async () => {
  const promptsRoot = await createTempPromptsRoot();
  const recipesDir = path.join(promptsRoot, "recipes");
  const kitsDir = path.join(promptsRoot, "kits");
  const snipsDir = path.join(promptsRoot, "snips");

  await fs.mkdir(recipesDir, { recursive: true });
  await fs.mkdir(kitsDir, { recursive: true });
  await fs.mkdir(snipsDir, { recursive: true });

  const basePrompt: PromptDefinition = {
    id: "shared-id",
    title: "Shared Title",
    summary: "Shared summary",
    body: "Shared body",
    tags: ["shared"],
    collection: "Shared",
    variables: [],
    outputType: "markdown",
    preferredModel: "gpt-4.1",
    favorite: false,
    status: "active",
    category: "recipe",
    createdAt: "2026-03-09T10:00:00.000Z",
    updatedAt: "2026-03-09T10:00:00.000Z"
  };

  await fs.writeFile(
    path.join(recipesDir, "shared-title.md"),
    serializePromptFile(basePrompt),
    "utf8"
  );
  await fs.writeFile(
    path.join(kitsDir, "unique-title.md"),
    serializePromptFile({
      ...basePrompt,
      title: "Unique Title",
      category: "kit"
    }),
    "utf8"
  );

  await assert.rejects(
    () => listPromptDefinitions(promptsRoot),
    (error: unknown) =>
      error instanceof PromptRepositoryError &&
      error.message.includes("Duplicate prompt id")
  );

  await fs.rm(promptsRoot, { recursive: true, force: true });
  await fs.mkdir(recipesDir, { recursive: true });
  await fs.mkdir(snipsDir, { recursive: true });

  await fs.writeFile(
    path.join(recipesDir, "shared-title.md"),
    serializePromptFile(basePrompt),
    "utf8"
  );
  await fs.writeFile(
    path.join(snipsDir, "shared-title.md"),
    serializePromptFile({
      ...basePrompt,
      id: "unique-id",
      title: "Another Title",
      category: "snip",
      subcategory: "role"
    }),
    "utf8"
  );

  await assert.rejects(
    () => listPromptDefinitions(promptsRoot),
    (error: unknown) =>
      error instanceof PromptRepositoryError &&
      error.message.includes("Duplicate prompt slug")
  );
});
