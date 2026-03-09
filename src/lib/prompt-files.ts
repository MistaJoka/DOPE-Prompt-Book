import {
  OUTPUT_TYPES,
  PREFERRED_MODELS,
  PROMPT_CATEGORIES,
  PROMPT_STATUSES,
  PromptCreateInput,
  PromptDefinition,
  PromptMutationInput,
  SNIP_SUBCATEGORIES
} from "../types/prompt";

const FRONTMATTER_KEYS = [
  "id",
  "title",
  "summary",
  "tags",
  "collection",
  "variables",
  "outputType",
  "preferredModel",
  "status",
  "category",
  "subcategory",
  "favorite",
  "createdAt",
  "updatedAt"
] as const;

type FrontmatterKey = (typeof FRONTMATTER_KEYS)[number];

type FrontmatterRecord = Partial<Record<FrontmatterKey, unknown>>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseScalar(raw: string): unknown {
  const trimmed = raw.trim();

  if (trimmed === "[]") {
    return [];
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    if (trimmed.startsWith("\"")) {
      return JSON.parse(trimmed);
    }

    return trimmed.slice(1, -1);
  }

  if (trimmed.length === 0) {
    return "";
  }

  if (trimmed.includes(":")) {
    return trimmed;
  }

  return trimmed;
}

function parseFrontmatterBlock(block: string, source: string): FrontmatterRecord {
  const lines = block.split(/\r?\n/);
  const parsed: FrontmatterRecord = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim()) {
      continue;
    }

    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):(?:\s(.*))?$/);

    if (!match) {
      throw new Error(`${source}: invalid frontmatter line "${line}"`);
    }

    const [, key, rest = ""] = match;

    if (!FRONTMATTER_KEYS.includes(key as FrontmatterKey)) {
      throw new Error(`${source}: unknown frontmatter key "${key}"`);
    }

    if (rest === "") {
      const arrayValues: string[] = [];
      let hasArrayValues = false;

      while (index + 1 < lines.length && /^\s+-\s/.test(lines[index + 1])) {
        hasArrayValues = true;
        index += 1;
        arrayValues.push(
          String(parseScalar(lines[index].replace(/^\s+-\s/, "")))
        );
      }

      parsed[key as FrontmatterKey] = hasArrayValues ? arrayValues : "";
      continue;
    }

    parsed[key as FrontmatterKey] = parseScalar(rest);
  }

  return parsed;
}

function readString(
  value: unknown,
  key: string,
  source: string,
  { allowEmpty = false }: { allowEmpty?: boolean } = {}
): string {
  if (typeof value !== "string") {
    throw new Error(`${source}: "${key}" must be a string`);
  }

  const nextValue = allowEmpty ? value.trim() : value.trim();

  if (!allowEmpty && nextValue.length === 0) {
    throw new Error(`${source}: "${key}" is required`);
  }

  return nextValue;
}

function readBoolean(value: unknown, key: string, source: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${source}: "${key}" must be a boolean`);
  }

  return value;
}

function readStringArray(value: unknown, key: string, source: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${source}: "${key}" must be an array`);
  }

  return value.map((entry, index) =>
    readString(entry, `${key}[${index}]`, source, { allowEmpty: false })
  );
}

function readEnum<T extends readonly string[]>(
  value: unknown,
  key: string,
  source: string,
  allowed: T
): T[number] {
  const nextValue = readString(value, key, source);

  if (!allowed.includes(nextValue)) {
    throw new Error(
      `${source}: "${key}" must be one of ${allowed.map((entry) => `"${entry}"`).join(", ")}`
    );
  }

  return nextValue as T[number];
}

function readDateString(value: unknown, key: string, source: string): string {
  const nextValue = readString(value, key, source);

  if (Number.isNaN(Date.parse(nextValue))) {
    throw new Error(`${source}: "${key}" must be an ISO date string`);
  }

  return nextValue;
}

function normalizePromptMutationInput(
  raw: unknown,
  source: string
): PromptMutationInput {
  if (!isObject(raw)) {
    throw new Error(`${source}: request payload must be an object`);
  }

  const category = readEnum(raw.category, "category", source, PROMPT_CATEGORIES);
  const subcategory =
    category === "snip"
      ? readEnum(raw.subcategory, "subcategory", source, SNIP_SUBCATEGORIES)
      : undefined;

  return {
    title: readString(raw.title, "title", source),
    summary: readString(raw.summary, "summary", source),
    body: readString(raw.body, "body", source),
    tags: readStringArray(raw.tags, "tags", source),
    collection: readString(raw.collection, "collection", source, { allowEmpty: true }),
    variables: readStringArray(raw.variables, "variables", source),
    outputType: readEnum(raw.outputType, "outputType", source, OUTPUT_TYPES),
    preferredModel: readEnum(
      raw.preferredModel,
      "preferredModel",
      source,
      PREFERRED_MODELS
    ),
    favorite:
      raw.favorite === undefined ? false : readBoolean(raw.favorite, "favorite", source),
    status: readEnum(raw.status, "status", source, PROMPT_STATUSES),
    category,
    ...(subcategory ? { subcategory } : {})
  };
}

export function validatePromptCreateInput(
  raw: unknown,
  source = "prompt payload"
): PromptCreateInput {
  const base = normalizePromptMutationInput(raw, source);

  if (!isObject(raw)) {
    return base;
  }

  if (raw.id === undefined) {
    return base;
  }

  return {
    ...base,
    id: readString(raw.id, "id", source)
  };
}

export function validatePromptMutationInput(
  raw: unknown,
  source = "prompt payload"
): PromptMutationInput {
  return normalizePromptMutationInput(raw, source);
}

export function validatePromptDefinition(
  raw: unknown,
  body: string,
  source = "prompt file"
): PromptDefinition {
  if (!isObject(raw)) {
    throw new Error(`${source}: frontmatter must be an object`);
  }

  const base = normalizePromptMutationInput({ ...raw, body }, source);

  return {
    ...base,
    id: readString(raw.id, "id", source),
    createdAt: readDateString(raw.createdAt, "createdAt", source),
    updatedAt: readDateString(raw.updatedAt, "updatedAt", source)
  };
}

export function parsePromptFile(content: string, source = "prompt file"): PromptDefinition {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`${source}: file must start with a YAML frontmatter block`);
  }

  const [, rawFrontmatter, rawBody] = match;
  const frontmatter = parseFrontmatterBlock(rawFrontmatter, source);
  const body = rawBody.replace(/\s+$/, "");

  return validatePromptDefinition(frontmatter, body, source);
}

function serializeScalar(value: string | boolean): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return JSON.stringify(value);
}

export function serializePromptFile(prompt: PromptDefinition): string {
  const lines: string[] = ["---"];
  const orderedEntries: Array<[FrontmatterKey, unknown]> = [
    ["id", prompt.id],
    ["title", prompt.title],
    ["summary", prompt.summary],
    ["tags", prompt.tags],
    ["collection", prompt.collection],
    ["variables", prompt.variables],
    ["outputType", prompt.outputType],
    ["preferredModel", prompt.preferredModel],
    ["status", prompt.status],
    ["category", prompt.category],
    ["subcategory", prompt.subcategory],
    ["favorite", prompt.favorite],
    ["createdAt", prompt.createdAt],
    ["updatedAt", prompt.updatedAt]
  ];

  for (const [key, value] of orderedEntries) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
        continue;
      }

      lines.push(`${key}:`);
      value.forEach((item) => lines.push(`  - ${serializeScalar(item)}`));
      continue;
    }

    lines.push(`${key}: ${serializeScalar(value as string | boolean)}`);
  }

  lines.push("---", "", prompt.body);
  return `${lines.join("\n").trimEnd()}\n`;
}

export function slugifyPromptTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
