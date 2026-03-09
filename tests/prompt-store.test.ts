import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_LIBRARY_FILTERS,
  getLibraryFacets,
  getLibraryItems,
  getRecentlyUsed,
  mergePromptDefinitions
} from "../src/lib/prompt-store";
import { PromptDefinition, PromptUsageMap } from "../src/types/prompt";

const definitions: PromptDefinition[] = [
  {
    id: "recipe-a",
    title: "Alpha Launch",
    summary: "Launch prompt",
    body: "Launch {{product}}",
    tags: ["launch", "marketing"],
    collection: "Go-To-Market",
    variables: ["product"],
    outputType: "markdown",
    preferredModel: "gpt-4.1",
    favorite: true,
    status: "active",
    category: "recipe",
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-08T10:00:00.000Z"
  },
  {
    id: "recipe-b",
    title: "Beta Risk Scanner",
    summary: "Risk prompt",
    body: "Scan {{backlog}}",
    tags: ["risk", "engineering"],
    collection: "Engineering",
    variables: ["backlog"],
    outputType: "json",
    preferredModel: "o4-mini",
    favorite: false,
    status: "draft",
    category: "recipe",
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-09T10:00:00.000Z"
  },
  {
    id: "snip-a",
    title: "Direct",
    summary: "Direct tone",
    body: "Be direct.",
    tags: ["tone"],
    collection: "Snips",
    variables: [],
    outputType: "markdown",
    preferredModel: "claude-sonnet",
    favorite: false,
    status: "active",
    category: "snip",
    subcategory: "tone",
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-05T10:00:00.000Z"
  },
  {
    id: "recipe-c",
    title: "Archived Prompt",
    summary: "Old prompt",
    body: "Old",
    tags: ["legacy"],
    collection: "Ops",
    variables: [],
    outputType: "markdown",
    preferredModel: "gpt-4o",
    favorite: false,
    status: "archived",
    category: "recipe",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-05T10:00:00.000Z"
  }
];

const usageMap: PromptUsageMap = {
  "recipe-a": { useCount: 2, lastUsedAt: "2026-03-09T12:00:00.000Z" },
  "recipe-b": { useCount: 5, lastUsedAt: "2026-03-09T13:00:00.000Z" }
};

test("getLibraryItems applies search, filters, and sort modes", () => {
  const prompts = mergePromptDefinitions(definitions, usageMap);

  assert.deepEqual(
    getLibraryItems(prompts, "recipes", "", DEFAULT_LIBRARY_FILTERS, "most-used").map(
      (prompt) => prompt.id
    ),
    ["recipe-b", "recipe-a"]
  );

  assert.deepEqual(
    getLibraryItems(
      prompts,
      "recipes",
      "launch",
      {
        ...DEFAULT_LIBRARY_FILTERS,
        tags: ["launch"],
        preferredModels: ["gpt-4.1"]
      },
      "alphabetical"
    ).map((prompt) => prompt.id),
    ["recipe-a"]
  );

  assert.deepEqual(
    getLibraryItems(
      prompts,
      "recipes",
      "",
      {
        ...DEFAULT_LIBRARY_FILTERS,
        statuses: ["archived"]
      },
      "alphabetical"
    ).map((prompt) => prompt.id),
    ["recipe-c"]
  );
});

test("facets and recently used are derived from prompt definitions and usage", () => {
  const prompts = mergePromptDefinitions(definitions, usageMap);
  const facets = getLibraryFacets(definitions, "recipes");

  assert.deepEqual(facets.collections, ["Engineering", "Go-To-Market", "Ops"]);
  assert.deepEqual(facets.outputTypes, ["json", "markdown"]);
  assert.deepEqual(
    getRecentlyUsed(prompts).map((prompt) => prompt.id),
    ["recipe-b", "recipe-a"]
  );
});
