import { ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PromptFilters, PromptItem, PromptStatus } from "@/types/prompt";

type FilterChipsProps = {
  filters: PromptFilters;
  options: {
    tags: string[];
    collection: string[];
    preferredModel: PromptItem["preferredModel"][];
    outputType: PromptItem["outputType"][];
  };
  onToggleFilter: (key: keyof PromptFilters, value: string) => void;
  onClearAll: () => void;
};

const statusOptions: PromptStatus[] = ["active", "draft", "archived"];

function FilterGroup({
  label,
  selected,
  options,
  onToggle
}: {
  label: string;
  selected: string[];
  options: string[];
  onToggle: (value: string) => void;
}){
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-foreground/90 hover:border-border">
        {label}
        {selected.length > 0 ? ` (${selected.length})` : ""}
        <ChevronDown className="h-3 w-3 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="absolute z-20 mt-2 min-w-56 rounded-lg border border-border bg-popover p-2 shadow-soft">
        <div className="max-h-52 overflow-y-auto pr-1">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
                className="h-3.5 w-3.5 rounded border-border bg-transparent text-primary focus:ring-primary"
              />
              <span className="truncate">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </details>
  );
}

export function FilterChips({
  filters,
  options,
  onToggleFilter,
  onClearAll
}: FilterChipsProps){
  const hasActiveFilters = Object.values(filters).some((entry) => entry.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterGroup
        label="Tags"
        selected={filters.tags}
        options={options.tags}
        onToggle={(value) => onToggleFilter("tags", value)}
      />
      <FilterGroup
        label="Collection"
        selected={filters.collection}
        options={options.collection}
        onToggle={(value) => onToggleFilter("collection", value)}
      />
      <FilterGroup
        label="Status"
        selected={filters.status}
        options={statusOptions}
        onToggle={(value) => onToggleFilter("status", value)}
      />
      <FilterGroup
        label="Model"
        selected={filters.preferredModel}
        options={options.preferredModel}
        onToggle={(value) => onToggleFilter("preferredModel", value)}
      />
      <FilterGroup
        label="Output"
        selected={filters.outputType}
        options={options.outputType}
        onToggle={(value) => onToggleFilter("outputType", value)}
      />

      {hasActiveFilters ? (
        <Button size="sm" variant="ghost" onClick={onClearAll} className="h-7 rounded-full px-2 text-xs">
          <X className="mr-1 h-3.5 w-3.5" />
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
