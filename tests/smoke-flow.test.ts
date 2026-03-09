import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { assemblePrompt, extractVariablesFromBlocks } from "../src/lib/composer";
import {
  createPromptDefinition,
  listPromptDefinitions
} from "../src/lib/prompt-repository";
import {
  DEFAULT_LIBRARY_FILTERS,
  getLibraryItems,
  mergePromptDefinitions
} from "../src/lib/prompt-store";
import { ComposerBlock } from "../src/types/prompt";

test("smoke flow covers repo-backed load, library lookup, and prompt assembly", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "dope-smoke-"));
  const promptsRoot = path.join(root, "prompts");
  const created = await createPromptDefinition(
    {
      title: "Executive Email",
      summary: "Rewrite notes for execs.",
      body: "Rewrite {{notes}} for {{audience}}.",
      tags: ["communication"],
      collection: "Leadership",
      variables: ["notes", "audience"],
      outputType: "email",
      preferredModel: "gpt-4o",
      favorite: false,
      status: "active",
      category: "recipe"
    },
    promptsRoot
  );

  const definitions = await listPromptDefinitions(promptsRoot);
  const prompts = mergePromptDefinitions(definitions, {
    [created.id]: { useCount: 1, lastUsedAt: "2026-03-09T12:00:00.000Z" }
  });
  const visiblePrompts = getLibraryItems(
    prompts,
    "recipes",
    "executive",
    DEFAULT_LIBRARY_FILTERS,
    "recently-used"
  );
  const blocks: ComposerBlock[] = visiblePrompts.map((prompt) => ({
    instanceId: `instance-${prompt.id}`,
    promptId: prompt.id,
    title: prompt.title,
    category: prompt.category,
    subcategory: prompt.subcategory,
    body: prompt.body,
    isExpanded: false
  }));

  assert.equal(visiblePrompts.length, 1);
  assert.deepEqual(extractVariablesFromBlocks(blocks), ["notes", "audience"]);
  assert.equal(
    assemblePrompt(blocks, {
      notes: "Launch slipped by one week.",
      audience: "the executive team"
    }),
    "Rewrite Launch slipped by one week. for the executive team."
  );
});
