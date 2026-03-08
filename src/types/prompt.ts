export type PromptStatus = "active" | "draft" | "archived";

export type OutputType = "markdown" | "json" | "bullet-list" | "email" | "table";

export type PreferredModel = "gpt-4.1" | "gpt-4o" | "o4-mini" | "claude-sonnet" | "gemini-pro";

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
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
  useCount: number;
  versions: PromptVersion[];
};

export type ViewMode = "grid" | "list" | "compact";

export type SortMode = "recently-edited" | "recently-used" | "most-used" | "alphabetical";

export type PromptFilters = {
  tags: string[];
  collection: string[];
  status: PromptStatus[];
  preferredModel: PreferredModel[];
  outputType: OutputType[];
};

export type PromptScope = "all" | "favorites" | "recent" | "collections" | "drafts" | "archived";

export type WorkspaceState = {
  prompts: PromptItem[];
  selectedPromptId: string | null;
  query: string;
  filters: PromptFilters;
  sort: SortMode;
  view: ViewMode;
  scope: PromptScope;
};
