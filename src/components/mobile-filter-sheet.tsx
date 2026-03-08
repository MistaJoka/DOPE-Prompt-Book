import { FilterChips } from "@/components/filter-chips";
import { Button } from "@/components/ui/button";
import { PromptFilters, PromptItem, SortMode, ViewMode } from "@/types/prompt";

type MobileFilterSheetProps = {
  open: boolean;
  onClose: () => void;
  filters: PromptFilters;
  options: {
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
};

export function MobileFilterSheet({
  open,
  onClose,
  filters,
  options,
  onToggleFilter,
  onClearFilters,
  sort,
  onSortChange,
  view,
  onViewChange
}: MobileFilterSheetProps){
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[75vh] rounded-t-xl border border-border bg-[#11171c] p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filters & View</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>

        <div className="space-y-3 overflow-y-auto pb-2">
          <FilterChips
            filters={filters}
            options={options}
            onToggleFilter={onToggleFilter}
            onClearAll={onClearFilters}
          />

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Sort</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortMode)}
            >
              <option value="recently-edited">Recently Edited</option>
              <option value="recently-used">Recently Used</option>
              <option value="most-used">Most Used</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">View</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              value={view}
              onChange={(event) => onViewChange(event.target.value as ViewMode)}
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
