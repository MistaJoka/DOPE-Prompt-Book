export type PromptStatus = "active" | "draft" | "archived";

export type OutputType = "markdown" | "json" | "bullet-list" | "email" | "table";

export type PreferredModel = "gpt-4.1" | "gpt-4o" | "o4-mini" | "claude-sonnet" | "gemini-pro";

export type PromptCategory = "snip" | "recipe" | "kit";

export type SnipSubcategory = "role" | "tone" | "output" | "rules";

export type PromptVersion = {
  id: string;
  body: string;
  updatedAt: string;
  note: string;
};

export type PromptItem = {
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
  lastUsedAt: string;
  useCount: number;
  versions: PromptVersion[];
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

export type LibraryTab = "snips" | "recipes" | "kits";

export type SortMode = "recently-edited" | "recently-used" | "most-used" | "alphabetical";

export type WorkspaceState = {
  prompts: PromptItem[];
  composerBlocks: ComposerBlock[];
  libraryDrawerOpen: boolean;
  libraryTab: LibraryTab;
  librarySearch: string;
  sort: SortMode;
};
