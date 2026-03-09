export const PROMPT_STATUSES = ["active", "draft", "archived"] as const;
export const OUTPUT_TYPES = [
  "markdown",
  "json",
  "bullet-list",
  "email",
  "table"
] as const;
export const PREFERRED_MODELS = [
  "gpt-4.1",
  "gpt-4o",
  "o4-mini",
  "claude-sonnet",
  "gemini-pro"
] as const;
export const PROMPT_CATEGORIES = ["snip", "recipe", "kit"] as const;
export const SNIP_SUBCATEGORIES = ["role", "tone", "output", "rules"] as const;
export const LIBRARY_TABS = ["snips", "recipes", "kits"] as const;
export const SORT_MODES = [
  "recently-edited",
  "recently-used",
  "most-used",
  "alphabetical"
] as const;

export type PromptStatus = (typeof PROMPT_STATUSES)[number];
export type OutputType = (typeof OUTPUT_TYPES)[number];
export type PreferredModel = (typeof PREFERRED_MODELS)[number];
export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];
export type SnipSubcategory = (typeof SNIP_SUBCATEGORIES)[number];
export type LibraryTab = (typeof LIBRARY_TABS)[number];
export type SortMode = (typeof SORT_MODES)[number];

export type PromptDefinition = {
  id: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  collection: string;
  variables: string[];
  outputType: OutputType;
  preferredModel: PreferredModel;
  favorite: boolean;
  status: PromptStatus;
  category: PromptCategory;
  subcategory?: SnipSubcategory;
  createdAt: string;
  updatedAt: string;
};

export type PromptUsageState = {
  lastUsedAt: string | null;
  useCount: number;
};

export type PromptUsageMap = Record<string, PromptUsageState>;

export type PromptRecord = PromptDefinition & PromptUsageState;

export type PromptMutationInput = {
  title: string;
  summary: string;
  body: string;
  tags: string[];
  collection: string;
  variables: string[];
  outputType: OutputType;
  preferredModel: PreferredModel;
  favorite: boolean;
  status: PromptStatus;
  category: PromptCategory;
  subcategory?: SnipSubcategory;
};

export type PromptCreateInput = PromptMutationInput & {
  id?: string;
};

export type ComposerBlock = {
  instanceId: string;
  promptId: string;
  title: string;
  category: PromptCategory;
  subcategory?: SnipSubcategory;
  body: string;
  isExpanded: boolean;
};

export type LibraryFilters = {
  tags: string[];
  collections: string[];
  statuses: PromptStatus[];
  preferredModels: PreferredModel[];
  outputTypes: OutputType[];
  favoritesOnly: boolean;
};

export type LibraryFacets = {
  tags: string[];
  collections: string[];
  statuses: PromptStatus[];
  preferredModels: PreferredModel[];
  outputTypes: OutputType[];
};

export type WorkspaceState = {
  composerBlocks: ComposerBlock[];
  libraryDrawerOpen: boolean;
  libraryTab: LibraryTab;
  librarySearch: string;
  sort: SortMode;
  filters: LibraryFilters;
  promptUsage: PromptUsageMap;
};
