import { mockPrompts } from "@/data/mock-prompts";
import {
  LibraryTab,
  PromptCategory,
  PromptItem,
  SnipSubcategory,
  SortMode,
  WorkspaceState
} from "@/types/prompt";

export const STORAGE_KEY = "prompt-workspace-state-v2";

export function createInitialState(): WorkspaceState {
  return {
    prompts: mockPrompts,
    composerBlocks: [],
    libraryDrawerOpen: true,
    libraryTab: "snips",
    librarySearch: "",
    sort: "recently-used"
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

    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    const initial = createInitialState();
    return {
      ...initial,
      ...parsed,
      // Always use fresh prompts from mock data (don't persist prompt list)
      prompts: initial.prompts
    };
  } catch {
    return createInitialState();
  }
}

export function persistState(state: WorkspaceState): void {
  if (typeof window === "undefined") return;
  // Persist everything except the prompts array (always loaded fresh from mock data)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { prompts, ...rest } = state;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

// ── Library filtering ────────────────────────────────────────────────────────

export function getLibraryItems(
  prompts: PromptItem[],
  tab: LibraryTab,
  search: string
): PromptItem[] {
  const q = search.trim().toLowerCase();

  const byTab = prompts.filter((p) => {
    if (p.status === "archived") return false;
    if (tab === "snips") return p.category === "snip";
    if (tab === "recipes") return p.category === "recipe";
    if (tab === "kits") return p.category === "kit";
    return true;
  });

  if (!q) return byTab;

  return byTab.filter((p) =>
    [p.title, p.summary, p.body, p.tags.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export function groupSnipsBySubcategory(
  snips: PromptItem[]
): Record<SnipSubcategory, PromptItem[]> {
  const groups: Record<SnipSubcategory, PromptItem[]> = {
    role: [],
    tone: [],
    output: [],
    rules: []
  };

  snips.forEach((p) => {
    if (p.subcategory && p.subcategory in groups) {
      groups[p.subcategory].push(p);
    }
  });

  return groups;
}

export function groupRecipesByCollection(
  recipes: PromptItem[]
): Record<string, PromptItem[]> {
  const groups: Record<string, PromptItem[]> = {};

  recipes.forEach((p) => {
    const key = p.collection || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  return groups;
}

export function getRecentlyUsed(prompts: PromptItem[], limit = 5): PromptItem[] {
  return [...prompts]
    .filter((p) => p.status !== "archived" && p.lastUsedAt)
    .sort((a, b) => +new Date(b.lastUsedAt) - +new Date(a.lastUsedAt))
    .slice(0, limit);
}

// ── Sort ─────────────────────────────────────────────────────────────────────

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

// ── Category label helpers ────────────────────────────────────────────────────

export function categoryLabel(category: PromptCategory, subcategory?: SnipSubcategory): string {
  if (category === "kit") return "Kit";
  if (category === "recipe") return "Recipe";
  if (category === "snip" && subcategory) {
    return subcategory.charAt(0).toUpperCase() + subcategory.slice(1);
  }
  return "Snip";
}
