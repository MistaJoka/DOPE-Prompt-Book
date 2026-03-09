import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  PromptCategory,
  PromptCreateInput,
  PromptDefinition,
  PromptMutationInput
} from "../types/prompt";
import {
  parsePromptFile,
  serializePromptFile,
  slugifyPromptTitle
} from "./prompt-files";

type PromptDirectory = "snips" | "recipes" | "kits";

type PromptEntry = PromptDefinition & {
  filePath: string;
  slug: string;
  directory: PromptDirectory;
};

const CATEGORY_DIRECTORIES: Record<PromptCategory, PromptDirectory> = {
  snip: "snips",
  recipe: "recipes",
  kit: "kits"
};

export class PromptRepositoryError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "PromptRepositoryError";
    this.statusCode = statusCode;
  }
}

export function getPromptsRoot(rootDir = process.cwd()): string {
  return path.join(rootDir, "prompts");
}

async function ensureDirectory(directory: string): Promise<void> {
  await fs.mkdir(directory, { recursive: true });
}

function promptDirectoryFor(category: PromptCategory): PromptDirectory {
  return CATEGORY_DIRECTORIES[category];
}

function createPromptId(input: PromptCreateInput): string {
  const suffix = randomUUID().slice(0, 8);

  if (input.category === "snip" && input.subcategory) {
    return `snip-${input.subcategory}-${suffix}`;
  }

  if (input.category === "kit") {
    return `kit-${suffix}`;
  }

  return `recipe-${suffix}`;
}

function createUniqueSlug(title: string, entries: PromptEntry[], ignoreId?: string): string {
  const baseSlug = slugifyPromptTitle(title) || "prompt";
  const usedSlugs = new Set(
    entries.filter((entry) => entry.id !== ignoreId).map((entry) => entry.slug)
  );

  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (usedSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

async function readPromptEntries(root = getPromptsRoot()): Promise<PromptEntry[]> {
  const directories: PromptDirectory[] = ["snips", "recipes", "kits"];
  const entries: PromptEntry[] = [];

  for (const directory of directories) {
    const absoluteDirectory = path.join(root, directory);

    try {
      const files = await fs.readdir(absoluteDirectory, { withFileTypes: true });

      for (const file of files) {
        if (!file.isFile() || !file.name.endsWith(".md")) {
          continue;
        }

        const filePath = path.join(absoluteDirectory, file.name);
        const content = await fs.readFile(filePath, "utf8");
        const definition = parsePromptFile(content, filePath);

        entries.push({
          ...definition,
          filePath,
          slug: file.name.replace(/\.md$/, ""),
          directory
        });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }

      throw error;
    }
  }

  const seenIds = new Map<string, string>();
  const seenSlugs = new Map<string, string>();

  for (const entry of entries) {
    if (seenIds.has(entry.id)) {
      throw new PromptRepositoryError(
        `Duplicate prompt id "${entry.id}" found in ${entry.filePath} and ${seenIds.get(entry.id)}`,
        500
      );
    }

    if (seenSlugs.has(entry.slug)) {
      throw new PromptRepositoryError(
        `Duplicate prompt slug "${entry.slug}" found in ${entry.filePath} and ${seenSlugs.get(entry.slug)}`,
        500
      );
    }

    seenIds.set(entry.id, entry.filePath);
    seenSlugs.set(entry.slug, entry.filePath);
  }

  return entries;
}

function withoutFileMetadata(entry: PromptEntry): PromptDefinition {
  return {
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    body: entry.body,
    tags: entry.tags,
    collection: entry.collection,
    variables: entry.variables,
    outputType: entry.outputType,
    preferredModel: entry.preferredModel,
    favorite: entry.favorite,
    status: entry.status,
    category: entry.category,
    subcategory: entry.subcategory,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt
  };
}

async function writePromptEntry(
  definition: PromptDefinition,
  slug: string,
  root = getPromptsRoot()
): Promise<string> {
  const directory = path.join(root, promptDirectoryFor(definition.category));
  const filePath = path.join(directory, `${slug}.md`);

  await ensureDirectory(directory);
  await fs.writeFile(filePath, serializePromptFile(definition), "utf8");

  return filePath;
}

async function deleteIfExists(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export async function listPromptDefinitions(root = getPromptsRoot()): Promise<PromptDefinition[]> {
  const entries = await readPromptEntries(root);

  return entries
    .map(withoutFileMetadata)
    .sort((left, right) => left.title.localeCompare(right.title));
}

export async function createPromptDefinition(
  input: PromptCreateInput,
  root = getPromptsRoot()
): Promise<PromptDefinition> {
  const entries = await readPromptEntries(root);
  const id = input.id ?? createPromptId(input);

  if (entries.some((entry) => entry.id === id)) {
    throw new PromptRepositoryError(`Prompt id "${id}" already exists`, 409);
  }

  const now = new Date().toISOString();
  const definition: PromptDefinition = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now
  };
  const slug = createUniqueSlug(definition.title, entries);

  await writePromptEntry(definition, slug, root);
  return definition;
}

async function getPromptEntryById(id: string, root = getPromptsRoot()): Promise<PromptEntry> {
  const entries = await readPromptEntries(root);
  const entry = entries.find((candidate) => candidate.id === id);

  if (!entry) {
    throw new PromptRepositoryError(`Prompt "${id}" was not found`, 404);
  }

  return entry;
}

export async function updatePromptDefinition(
  id: string,
  input: PromptMutationInput,
  root = getPromptsRoot()
): Promise<PromptDefinition> {
  const entries = await readPromptEntries(root);
  const currentEntry = entries.find((entry) => entry.id === id);

  if (!currentEntry) {
    throw new PromptRepositoryError(`Prompt "${id}" was not found`, 404);
  }

  const currentPrompt = withoutFileMetadata(currentEntry);
  const nextDefinition: PromptDefinition = {
    ...currentPrompt,
    ...input,
    id: currentEntry.id,
    createdAt: currentEntry.createdAt,
    updatedAt: new Date().toISOString()
  };
  const nextSlug = createUniqueSlug(nextDefinition.title, entries, id);
  const nextFilePath = await writePromptEntry(nextDefinition, nextSlug, root);

  if (nextFilePath !== currentEntry.filePath) {
    await deleteIfExists(currentEntry.filePath);
  }

  return nextDefinition;
}

export async function archivePromptDefinition(
  id: string,
  root = getPromptsRoot()
): Promise<PromptDefinition> {
  const prompt = withoutFileMetadata(await getPromptEntryById(id, root));

  return updatePromptDefinition(
    id,
    {
      title: prompt.title,
      summary: prompt.summary,
      body: prompt.body,
      tags: prompt.tags,
      collection: prompt.collection,
      variables: prompt.variables,
      outputType: prompt.outputType,
      preferredModel: prompt.preferredModel,
      favorite: prompt.favorite,
      status: "archived",
      category: prompt.category,
      subcategory: prompt.subcategory
    },
    root
  );
}

export async function duplicatePromptDefinition(
  id: string,
  root = getPromptsRoot()
): Promise<PromptDefinition> {
  const prompt = await getPromptEntryById(id, root);

  return createPromptDefinition(
    {
      title: `${prompt.title} Copy`,
      summary: prompt.summary,
      body: prompt.body,
      tags: prompt.tags,
      collection: prompt.collection,
      variables: prompt.variables,
      outputType: prompt.outputType,
      preferredModel: prompt.preferredModel,
      favorite: false,
      status: "draft",
      category: prompt.category,
      subcategory: prompt.subcategory
    },
    root
  );
}
