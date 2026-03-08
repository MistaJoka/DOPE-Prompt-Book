import { Command, LayoutGrid, List, Rows3, SlidersHorizontal } from "lucide-react";

import { FilterChips } from "@/components/filter-chips";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { PromptFilters, PromptItem, SortMode, ViewMode } from "@/types/prompt";

type TopToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  filters: PromptFilters;
  filterOptions: {
    tags: string[];
    collection: string[];
    preferredModel: PromptItem["preferredModel"][];
    outputType: PromptItem["outputType"][];
  };
  onToggleFilter: (key: keyof PromptFilters, value: string) => void;
  onClearFilters: () => void;
  sort: SortMode;
  onSortChange: (sort: SortMode) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewPrompt: () => void;
  onCommandPaletteOpen: () => void;
  onOpenMobileFilters: () => void;
};

export function TopToolbar({
  query,
  onQueryChange,
  filters,
  filterOptions,
  onToggleFilter,
  onClearFilters,
  sort,
  onSortChange,
  view,
  onViewChange,
  onNewPrompt,
  onCommandPaletteOpen,
  onOpenMobileFilters
}: TopToolbarProps){
  return (
    <header className="border-b border-border/80 bg-[#10151a]/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <SearchBar query={query} onQueryChange={onQueryChange} />
        <Button variant="outline" size="icon" onClick={onOpenMobileFilters} className="md:hidden">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onCommandPaletteOpen}>
          <Command className="h-4 w-4" />
        </Button>
        <Button onClick={onNewPrompt}>New Prompt</Button>
      </div>

      <div className="mt-3 hidden items-center justify-between gap-3 md:flex">
        <FilterChips
          filters={filters}
          options={filterOptions}
          onToggleFilter={onToggleFilter}
          onClearAll={onClearFilters}
        />
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-border/70 bg-card px-2 text-xs"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortMode)}
          >
            <option value="recently-edited">Recently Edited</option>
            <option value="recently-used">Recently Used</option>
            <option value="most-used">Most Used</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <div className="flex rounded-md border border-border/70 bg-card p-0.5">
            <Button
              size="icon"
              variant={view === "grid" ? "secondary" : "ghost"}
              onClick={() => onViewChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={view === "list" ? "secondary" : "ghost"}
              onClick={() => onViewChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={view === "compact" ? "secondary" : "ghost"}
              onClick={() => onViewChange("compact")}
            >
              <Rows3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
