import assert from "node:assert/strict";
import test from "node:test";

import {
  parsePromptFile,
  serializePromptFile,
  validatePromptMutationInput
} from "../src/lib/prompt-files";
import { PromptDefinition } from "../src/types/prompt";

const promptDefinition: PromptDefinition = {
  id: "recipe-1234abcd",
  title: "Launch Brief",
  summary: "Turn notes into a launch brief.",
  body: "Write a launch brief for {{product_name}}.",
  tags: ["launch", "marketing"],
  collection: "Go-To-Market",
  variables: ["product_name"],
  outputType: "markdown",
  preferredModel: "gpt-4.1",
  favorite: true,
  status: "active",
  category: "recipe",
  createdAt: "2026-03-09T10:00:00.000Z",
  updatedAt: "2026-03-09T10:00:00.000Z"
};

test("serializePromptFile round-trips through parsePromptFile", () => {
  const fileContents = serializePromptFile(promptDefinition);
  assert.deepEqual(parsePromptFile(fileContents, "roundtrip.md"), promptDefinition);
});

test("parsePromptFile rejects missing required frontmatter", () => {
  assert.throws(
    () =>
      parsePromptFile(
        `---\nid: "broken"\nsummary: "Missing title"\ntags: []\ncollection: "Ops"\nvariables: []\noutputType: "markdown"\npreferredModel: "gpt-4.1"\nstatus: "active"\ncategory: "recipe"\nfavorite: false\ncreatedAt: "2026-03-09T10:00:00.000Z"\nupdatedAt: "2026-03-09T10:00:00.000Z"\n---\nBody`,
        "broken.md"
      ),
    /"title" must be a string/
  );
});

test("validatePromptMutationInput rejects invalid enums", () => {
  assert.throws(
    () =>
      validatePromptMutationInput({
        title: "Broken",
        summary: "Broken",
        body: "Broken",
        tags: [],
        collection: "Ops",
        variables: [],
        outputType: "markdown",
        preferredModel: "not-a-model",
        favorite: false,
        status: "active",
        category: "recipe"
      }),
    /preferredModel/
  );
});
