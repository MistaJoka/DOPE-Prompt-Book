import { mockPrompts } from "@/data/mock-prompts";
import {
  PromptFilters,
  PromptItem,
  PromptScope,
  SortMode,
  WorkspaceState
} from "@/types/prompt";

export const STORAGE_KEY = "prompt-workspace-state-v1";

export const defaultFilters: PromptFilters = {
  tags: [],
  collection: [],
  status: [],
  preferredModel: [],
  outputType: []
};

export function createInitialState(): WorkspaceState {
  return {
    prompts: mockPrompts,
    selectedPromptId: mockPrompts[0]?.id ?? null,
    query: "",
    filters: defaultFilters,
    sort: "recently-edited",
    view: "list",
    scope: "all"
  };
}

export function loadState(): WorkspaceState {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialState();
    }

    const parsed = JSON.parse(raw) as WorkspaceState;
    return {
      ...createInitialState(),
      ...parsed
    };
  } catch {
    return createInitialState();
  }
}

export function persistState(state: WorkspaceState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyScope(prompts: PromptItem[], scope: PromptScope): PromptItem[] {
  switch (scope) {
    case "favorites":
      return prompts.filter((p) => p.favorite && p.status !== "archived");
    case "recent":
      return [...prompts]
        .sort((a, b) => +new Date(b.lastUsedAt) - +new Date(a.lastUsedAt))
        .slice(0, 20);
    case "drafts":
      return prompts.filter((p) => p.status === "draft");
    case "archived":
      return prompts.filter((p) => p.status === "archived");
    case "collections":
    case "all":
    default:
      return prompts;
  }
}

function includesInFacet<T extends string>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

export function filterPrompts(state: WorkspaceState): PromptItem[] {
  const { prompts, filters, query, scope } = state;
  const lowerQuery = query.trim().toLowerCase();

  return applyScope(prompts, scope).filter((prompt) => {
    const inSearch =
      lowerQuery.length === 0 ||
      [
        prompt.title,
        prompt.summary,
        prompt.body,
        prompt.collection,
        prompt.tags.join(" ")
      ]
        .join(" ")
        .toLowerCase()
        .includes(lowerQuery);

    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((tag) => prompt.tags.includes(tag));

    return (
      inSearch &&
      matchesTags &&
      includesInFacet(filters.collection, prompt.collection) &&
      includesInFacet(filters.status, prompt.status) &&
      includesInFacet(filters.preferredModel, prompt.preferredModel) &&
      includesInFacet(filters.outputType, prompt.outputType)
    );
  });
}

export function sortPrompts(prompts: PromptItem[], sortMode: SortMode): PromptItem[] {
  const sorted = [...prompts];

  switch (sortMode) {
    case "recently-used":
      return sorted.sort((a, b) => +new Date(b.lastUsedAt) - +new Date(a.lastUsedAt));
    case "most-used":
      return sorted.sort((a, b) => b.useCount - a.useCount);
    case "alphabetical":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "recently-edited":
    default:
      return sorted.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }
}

export function getFacetOptions(prompts: PromptItem[]): {
  tags: string[];
  collection: string[];
  preferredModel: PromptItem["preferredModel"][];
  outputType: PromptItem["outputType"][];
} {
  const tags = new Set<string>();
  const collection = new Set<string>();
  const preferredModel = new Set<PromptItem["preferredModel"]>();
  const outputType = new Set<PromptItem["outputType"]>();

  prompts.forEach((prompt) => {
    prompt.tags.forEach((tag) => tags.add(tag));
    collection.add(prompt.collection);
    preferredModel.add(prompt.preferredModel);
    outputType.add(prompt.outputType);
  });

  return {
    tags: [...tags].sort(),
    collection: [...collection].sort(),
    preferredModel: [...preferredModel].sort(),
    outputType: [...outputType].sort()
  };
}
