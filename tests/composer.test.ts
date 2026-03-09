import assert from "node:assert/strict";
import test from "node:test";

import {
  assemblePrompt,
  extractVariables,
  extractVariablesFromBlocks,
  reorderComposerBlocks
} from "../src/lib/composer";
import { ComposerBlock } from "../src/types/prompt";

const blocks: ComposerBlock[] = [
  {
    instanceId: "block-1",
    promptId: "prompt-1",
    title: "Role",
    category: "snip",
    subcategory: "role",
    body: "You are a {{role}}.",
    isExpanded: false
  },
  {
    instanceId: "block-2",
    promptId: "prompt-2",
    title: "Task",
    category: "recipe",
    body: "Summarize {{topic}} for {{audience}}.",
    isExpanded: false
  }
];

test("extractVariables dedupes repeated template variables", () => {
  assert.deepEqual(extractVariables("{{topic}} {{topic}} {{audience}}"), [
    "topic",
    "audience"
  ]);
  assert.deepEqual(extractVariablesFromBlocks(blocks), ["role", "topic", "audience"]);
});

test("assemblePrompt substitutes only provided variables", () => {
  assert.equal(
    assemblePrompt(blocks, { role: "senior engineer", topic: "the diff" }),
    "You are a senior engineer.\n\nSummarize the diff for {{audience}}."
  );
});

test("reorderComposerBlocks moves items and ignores invalid sources", () => {
  assert.deepEqual(
    reorderComposerBlocks(blocks, 1, 0).map((block) => block.instanceId),
    ["block-2", "block-1"]
  );
  assert.deepEqual(reorderComposerBlocks(blocks, 5, 0), blocks);
});
