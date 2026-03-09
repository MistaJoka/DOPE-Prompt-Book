import {
  LibraryFacets,
  LibraryFilters,
  LibraryTab,
  OutputType,
  PromptDefinition,
  PromptRecord,
  PreferredModel,
  PromptStatus,
  PromptUsageMap,
  SnipSubcategory,
  SortMode,
  WorkspaceState
} from "../types/prompt";

export const STORAGE_KEY = "dope-prompt-workspace-v3";

export const DEFAULT_LIBRARY_FILTERS: LibraryFilters = {
  tags: [],
  collections: [],
  statuses: [],
  preferredModels: [],
  outputTypes: [],
  favoritesOnly: false
};

export function createInitialWorkspaceState(): WorkspaceState {
  return {
    composerBlocks: [],
    libraryDrawerOpen: true,
    libraryTab: "snips",
    librarySearch: "",
    sort: "recently-edited",
    filters: DEFAULT_LIBRARY_FILTERS,
    promptUsage: {}
  };
}

function sanitizeUsageMap(raw: unknown): PromptUsageMap {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(raw).flatMap(([promptId, usage]) => {
      if (!usage || typeof usage !== "object") {
        return [];
      }

      const candidate = usage as Record<string, unknown>;
      const useCount =
        typeof candidate.useCount === "number" && candidate.useCount >= 0
          ? candidate.useCount
          : 0;
      const lastUsedAt =
        typeof candidate.lastUsedAt === "string" && candidate.lastUsedAt.length > 0
          ? candidate.lastUsedAt
          : null;

      return [[promptId, { useCount, lastUsedAt }]];
    })
  );
}

function sanitizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((value): value is string => typeof value === "string");
}

function sanitizeStatuses(raw: unknown): PromptStatus[] {
  return sanitizeStringArray(raw).filter(
    (value): value is PromptStatus =>
      value === "active" || value === "draft" || value === "archived"
  );
}

function sanitizePreferredModels(raw: unknown): PreferredModel[] {
  return sanitizeStringArray(raw).filter(
    (value): value is PreferredModel =>
      value === "gpt-4.1" ||
      value === "gpt-4o" ||
      value === "o4-mini" ||
      value === "claude-sonnet" ||
      value === "gemini-pro"
  );
}

function sanitizeOutputTypes(raw: unknown): OutputType[] {
  return sanitizeStringArray(raw).filter(
    (value): value is OutputType =>
      value === "markdown" ||
      value === "json" ||
      value === "bullet-list" ||
      value === "email" ||
      value === "table"
  );
}

export function loadWorkspaceState(): WorkspaceState {
  if (typeof window === "undefined") {
    return createInitialWorkspaceState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createInitialWorkspaceState();
    }

    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    const initial = createInitialWorkspaceState();

    return {
      ...initial,
      composerBlocks: Array.isArray(parsed.composerBlocks) ? parsed.composerBlocks : [],
      libraryDrawerOpen:
        typeof parsed.libraryDrawerOpen === "boolean"
          ? parsed.libraryDrawerOpen
          : initial.libraryDrawerOpen,
      libraryTab:
        parsed.libraryTab === "snips" ||
        parsed.libraryTab === "recipes" ||
        parsed.libraryTab === "kits"
          ? parsed.libraryTab
          : initial.libraryTab,
      librarySearch:
        typeof parsed.librarySearch === "string"
          ? parsed.librarySearch
          : initial.librarySearch,
      sort:
        parsed.sort === "recently-edited" ||
        parsed.sort === "recently-used" ||
        parsed.sort === "most-used" ||
        parsed.sort === "alphabetical"
          ? parsed.sort
          : initial.sort,
      filters: {
        tags: sanitizeStringArray(parsed.filters?.tags),
        collections: sanitizeStringArray(parsed.filters?.collections),
        statuses: sanitizeStatuses(parsed.filters?.statuses),
        preferredModels: sanitizePreferredModels(parsed.filters?.preferredModels),
        outputTypes: sanitizeOutputTypes(parsed.filters?.outputTypes),
        favoritesOnly:
          typeof parsed.filters?.favoritesOnly === "boolean"
            ? parsed.filters.favoritesOnly
            : false
      },
      promptUsage: sanitizeUsageMap(parsed.promptUsage)
    };
  } catch {
    return createInitialWorkspaceState();
  }
}

export function persistWorkspaceState(state: WorkspaceState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function mergePromptDefinitions(
  definitions: PromptDefinition[],
  usageMap: PromptUsageMap
): PromptRecord[] {
  return definitions.map((definition) => {
    const usage = usageMap[definition.id];

    return {
      ...definition,
      lastUsedAt: usage?.lastUsedAt ?? null,
      useCount: usage?.useCount ?? 0
    };
  });
}

function includesFilter<T extends string>(activeValues: T[], value: T): boolean {
  return activeValues.length === 0 || activeValues.includes(value);
}

function matchesSearch(prompt: PromptRecord, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [prompt.title, prompt.summary, prompt.body, prompt.collection, prompt.tags.join(" "), prompt.variables.join(" ")]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesTab(prompt: PromptRecord, tab: LibraryTab): boolean {
  if (tab === "snips") return prompt.category === "snip";
  if (tab === "recipes") return prompt.category === "recipe";
  return prompt.category === "kit";
}

function matchesFilters(prompt: PromptRecord, filters: LibraryFilters): boolean {
  const statusMatches =
    filters.statuses.length === 0
      ? prompt.status !== "archived"
      : includesFilter(filters.statuses, prompt.status);

  return (
    statusMatches &&
    includesFilter(filters.preferredModels, prompt.preferredModel) &&
    includesFilter(filters.outputTypes, prompt.outputType) &&
    (filters.collections.length === 0 || filters.collections.includes(prompt.collection)) &&
    (filters.tags.length === 0 || prompt.tags.some((tag) => filters.tags.includes(tag))) &&
    (!filters.favoritesOnly || prompt.favorite)
  );
}

function dateValue(dateString: string | null): number {
  if (!dateString) {
    return 0;
  }

  const value = Date.parse(dateString);
  return Number.isNaN(value) ? 0 : value;
}

export function sortPrompts(prompts: PromptRecord[], sortMode: SortMode): PromptRecord[] {
  const sorted = [...prompts];

  switch (sortMode) {
    case "recently-used":
      return sorted.sort(
        (left, right) =>
          dateValue(right.lastUsedAt) - dateValue(left.lastUsedAt) ||
          right.useCount - left.useCount ||
          right.updatedAt.localeCompare(left.updatedAt)
      );
    case "most-used":
      return sorted.sort(
        (left, right) =>
          right.useCount - left.useCount ||
          dateValue(right.lastUsedAt) - dateValue(left.lastUsedAt) ||
          left.title.localeCompare(right.title)
      );
    case "alphabetical":
      return sorted.sort((left, right) => left.title.localeCompare(right.title));
    case "recently-edited":
    default:
      return sorted.sort(
        (left, right) =>
          dateValue(right.updatedAt) - dateValue(left.updatedAt) ||
          left.title.localeCompare(right.title)
      );
  }
}

export function getLibraryItems(
  prompts: PromptRecord[],
  tab: LibraryTab,
  search: string,
  filters: LibraryFilters,
  sortMode: SortMode
): PromptRecord[] {
  return sortPrompts(
    prompts.filter(
      (prompt) =>
        matchesTab(prompt, tab) &&
        matchesSearch(prompt, search) &&
        matchesFilters(prompt, filters)
    ),
    sortMode
  );
}

export function groupSnipsBySubcategory(
  snips: PromptRecord[]
): Record<SnipSubcategory, PromptRecord[]> {
  return {
    role: snips.filter((prompt) => prompt.subcategory === "role"),
    tone: snips.filter((prompt) => prompt.subcategory === "tone"),
    output: snips.filter((prompt) => prompt.subcategory === "output"),
    rules: snips.filter((prompt) => prompt.subcategory === "rules")
  };
}

export function groupRecipesByCollection(
  recipes: PromptRecord[]
): Record<string, PromptRecord[]> {
  return recipes.reduce<Record<string, PromptRecord[]>>((groups, prompt) => {
    const key = prompt.collection || "Other";

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(prompt);
    return groups;
  }, {});
}

export function getRecentlyUsed(prompts: PromptRecord[], limit = 5): PromptRecord[] {
  return [...prompts]
    .filter((prompt) => prompt.status !== "archived" && prompt.useCount > 0)
    .sort(
      (left, right) =>
        dateValue(right.lastUsedAt) - dateValue(left.lastUsedAt) ||
        right.useCount - left.useCount
    )
    .slice(0, limit);
}

export function categoryLabel(
  category: PromptRecord["category"],
  subcategory?: PromptRecord["subcategory"]
): string {
  if (category === "kit") return "Kit";
  if (category === "recipe") return "Recipe";
  if (category === "snip" && subcategory) {
    return subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
  }
  return "Snip";
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right)
  );
}

export function getLibraryFacets(
  prompts: PromptDefinition[],
  tab?: LibraryTab
): LibraryFacets {
  const scopedPrompts = tab
    ? prompts.filter((prompt) => matchesTab({ ...prompt, lastUsedAt: null, useCount: 0 }, tab))
    : prompts;

  return {
    tags: uniqueSorted(scopedPrompts.flatMap((prompt) => prompt.tags)),
    collections: uniqueSorted(scopedPrompts.map((prompt) => prompt.collection)),
    statuses: ["active", "draft", "archived"],
    preferredModels: uniqueSorted(
      scopedPrompts.map((prompt) => prompt.preferredModel)
    ) as LibraryFacets["preferredModels"],
    outputTypes: uniqueSorted(
      scopedPrompts.map((prompt) => prompt.outputType)
    ) as LibraryFacets["outputTypes"]
  };
}

export function hasActiveFilters(filters: LibraryFilters): boolean {
  return (
    filters.favoritesOnly ||
    filters.tags.length > 0 ||
    filters.collections.length > 0 ||
    filters.statuses.length > 0 ||
    filters.preferredModels.length > 0 ||
    filters.outputTypes.length > 0
  );
}
