"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  X
} from "lucide-react";

import {
  categoryLabel,
  getLibraryFacets,
  getLibraryItems,
  getRecentlyUsed,
  groupRecipesByCollection,
  groupSnipsBySubcategory,
  hasActiveFilters
} from "@/lib/prompt-store";
import {
  LibraryFilters,
  LibraryTab,
  PromptRecord,
  SORT_MODES,
  SnipSubcategory,
  SortMode
} from "@/types/prompt";

const SNIP_ORDER: SnipSubcategory[] = ["role", "tone", "output", "rules"];

const TABS: { id: LibraryTab; label: string }[] = [
  { id: "snips", label: "Snips" },
  { id: "recipes", label: "Recipes" },
  { id: "kits", label: "Kits" }
];

const SORT_LABELS: Record<SortMode, string> = {
  "recently-edited": "Recently edited",
  "recently-used": "Recently used",
  "most-used": "Most used",
  alphabetical: "Alphabetical"
};

type FilterKey =
  | "tags"
  | "collections"
  | "statuses"
  | "preferredModels"
  | "outputTypes";

interface LibraryDrawerProps {
  prompts: PromptRecord[];
  loading: boolean;
  error: string | null;
  tab: LibraryTab;
  search: string;
  sort: SortMode;
  filters: LibraryFilters;
  focusSearchSignal: number;
  onTabChange: (tab: LibraryTab) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: SortMode) => void;
  onFiltersChange: (filters: LibraryFilters) => void;
  onAddToComposer: (prompt: PromptRecord) => void;
  onEditPrompt: (prompt: PromptRecord) => void;
  onDuplicatePrompt: (prompt: PromptRecord) => void;
  onToggleFavorite: (prompt: PromptRecord) => void;
  onArchivePrompt: (prompt: PromptRecord) => void;
  onNewPrompt: () => void;
  writeActionsEnabled: boolean;
  writeDisabledMessage: string;
  onRetry: () => void;
}

function PromptActionButton({
  label,
  disabled = false,
  onClick,
  children
}: {
  label: string;
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      disabled={disabled}
      className={`rounded p-1 transition-colors ${
        disabled
          ? "cursor-not-allowed text-white/15"
          : "text-white/35 hover:bg-white/[0.06] hover:text-white/75"
      }`}
    >
      {children}
    </button>
  );
}

function PromptRow({
  prompt,
  writeActionsEnabled,
  writeDisabledMessage,
  onAdd,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onArchive
}: {
  prompt: PromptRecord;
  writeActionsEnabled: boolean;
  writeDisabledMessage: string;
  onAdd: (prompt: PromptRecord) => void;
  onEdit: (prompt: PromptRecord) => void;
  onDuplicate: (prompt: PromptRecord) => void;
  onToggleFavorite: (prompt: PromptRecord) => void;
  onArchive: (prompt: PromptRecord) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onAdd(prompt)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onAdd(prompt);
        }
      }}
      className="group relative w-full cursor-pointer rounded-lg border border-transparent px-3 py-2.5 text-left transition-all hover:border-white/[0.06] hover:bg-white/[0.04]"
    >
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-white/80 transition-colors group-hover:text-white">
              {prompt.title}
            </p>
            {prompt.favorite && (
              <Star size={12} className="shrink-0 fill-amber-300 text-amber-300" />
            )}
            {prompt.status === "draft" && (
              <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/35">
                Draft
              </span>
            )}
            {prompt.status === "archived" && (
              <span className="shrink-0 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-red-300/80">
                Archived
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-white/35">{prompt.summary}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/25">
            <span>{categoryLabel(prompt.category, prompt.subcategory)}</span>
            <span>{prompt.collection}</span>
            <span>{prompt.preferredModel}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <PromptActionButton
            label="Add to composer"
            onClick={(event) => {
              event.stopPropagation();
              onAdd(prompt);
            }}
          >
            <Plus size={13} />
          </PromptActionButton>
          <PromptActionButton
            label={writeActionsEnabled ? "Edit prompt" : writeDisabledMessage}
            disabled={!writeActionsEnabled}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(prompt);
            }}
          >
            <Pencil size={13} />
          </PromptActionButton>
          <PromptActionButton
            label={writeActionsEnabled ? "Duplicate prompt" : writeDisabledMessage}
            disabled={!writeActionsEnabled}
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate(prompt);
            }}
          >
            <Copy size={13} />
          </PromptActionButton>
          <PromptActionButton
            label={
              writeActionsEnabled
                ? prompt.favorite
                  ? "Remove favorite"
                  : "Add favorite"
                : writeDisabledMessage
            }
            disabled={!writeActionsEnabled}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(prompt);
            }}
          >
            <Star
              size={13}
              className={prompt.favorite ? "fill-amber-300 text-amber-300" : undefined}
            />
          </PromptActionButton>
          <PromptActionButton
            label={writeActionsEnabled ? "Archive prompt" : writeDisabledMessage}
            disabled={!writeActionsEnabled}
            onClick={(event) => {
              event.stopPropagation();
              onArchive(prompt);
            }}
          >
            <Archive size={13} />
          </PromptActionButton>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  label,
  count,
  isOpen,
  onToggle
}: {
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="group flex w-full items-center gap-1.5 px-1 py-1.5 text-left"
    >
      {isOpen ? (
        <ChevronDown
          size={12}
          className="text-white/30 transition-colors group-hover:text-white/50"
        />
      ) : (
        <ChevronRight
          size={12}
          className="text-white/30 transition-colors group-hover:text-white/50"
        />
      )}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 transition-colors group-hover:text-white/60">
        {label}
      </span>
      <span className="ml-auto text-[10px] text-white/25">{count}</span>
    </button>
  );
}

function FilterGroup({
  label,
  options,
  activeValues,
  onToggle
}: {
  label: string;
  options: string[];
  activeValues: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/35">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isActive = activeValues.includes(option);

          return (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={`rounded-full border px-2 py-1 text-[11px] transition-colors ${
                isActive
                  ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-100"
                  : "border-white/[0.08] text-white/45 hover:border-white/[0.14] hover:text-white/75"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function filterCount(filters: LibraryFilters): number {
  return (
    filters.tags.length +
    filters.collections.length +
    filters.statuses.length +
    filters.preferredModels.length +
    filters.outputTypes.length +
    (filters.favoritesOnly ? 1 : 0)
  );
}

export function LibraryDrawer({
  prompts,
  loading,
  error,
  tab,
  search,
  sort,
  filters,
  focusSearchSignal,
  onTabChange,
  onSearchChange,
  onSortChange,
  onFiltersChange,
  onAddToComposer,
  onEditPrompt,
  onDuplicatePrompt,
  onToggleFavorite,
  onArchivePrompt,
  onNewPrompt,
  writeActionsEnabled,
  writeDisabledMessage,
  onRetry
}: LibraryDrawerProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (focusSearchSignal > 0) {
      searchRef.current?.focus();
      searchRef.current?.select();
    }
  }, [focusSearchSignal]);

  const facets = useMemo(() => getLibraryFacets(prompts, tab), [prompts, tab]);
  const filtered = useMemo(
    () => getLibraryItems(prompts, tab, search, filters, sort),
    [prompts, tab, search, filters, sort]
  );
  const hasFilters = hasActiveFilters(filters);
  const recentItems =
    !search && !hasFilters ? getRecentlyUsed(prompts.filter((prompt) => prompt.category !== "kit")) : [];

  const toggleSection = (key: string) => {
    setCollapsedSections((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const toggleArrayFilter = (key: FilterKey, value: string) => {
    const activeValues = filters[key] as string[];
    const nextValues = activeValues.includes(value)
      ? activeValues.filter((entry) => entry !== value)
      : [...activeValues, value];

    onFiltersChange({
      ...filters,
      [key]: nextValues
    } as LibraryFilters);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-2 px-1 py-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg border border-white/[0.05] bg-white/[0.03]"
            />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
          <p className="text-sm text-red-200/85">{error}</p>
          <button
            onClick={onRetry}
            className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-white/[0.14] hover:text-white/80"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
          <p className="text-sm text-white/30">
            {search || hasFilters ? "No prompts match the current library view." : "No prompts yet."}
          </p>
          {(search || hasFilters) && (
            <button
              onClick={() => {
                onSearchChange("");
                onFiltersChange({
                  tags: [],
                  collections: [],
                  statuses: [],
                  preferredModels: [],
                  outputTypes: [],
                  favoritesOnly: false
                });
              }}
              className="text-xs text-white/50 transition-colors hover:text-white/75"
            >
              Clear search and filters
            </button>
          )}
        </div>
      );
    }

    if (tab === "snips") {
      const groups = groupSnipsBySubcategory(filtered);

      return (
        <div className="flex flex-col gap-1">
          {SNIP_ORDER.map((subcategory) => {
            const items = groups[subcategory];

            if (!items.length) {
              return null;
            }

            const sectionKey = `snip-${subcategory}`;
            const isOpen = !collapsedSections.has(sectionKey);

            return (
              <div key={subcategory}>
                <SectionHeader
                  label={subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                  count={items.length}
                  isOpen={isOpen}
                  onToggle={() => toggleSection(sectionKey)}
                />
                {isOpen && (
                  <div className="ml-1 flex flex-col gap-0.5">
                    {items.map((prompt) => (
                      <PromptRow
                        key={prompt.id}
                        prompt={prompt}
                        writeActionsEnabled={writeActionsEnabled}
                        writeDisabledMessage={writeDisabledMessage}
                        onAdd={onAddToComposer}
                        onEdit={onEditPrompt}
                        onDuplicate={onDuplicatePrompt}
                        onToggleFavorite={onToggleFavorite}
                        onArchive={onArchivePrompt}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === "recipes") {
      const groups = groupRecipesByCollection(filtered);

      return (
        <div className="flex flex-col gap-1">
          {Object.entries(groups)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([collection, items]) => {
              const sectionKey = `recipe-${collection}`;
              const isOpen = !collapsedSections.has(sectionKey);

              return (
                <div key={collection}>
                  <SectionHeader
                    label={collection}
                    count={items.length}
                    isOpen={isOpen}
                    onToggle={() => toggleSection(sectionKey)}
                  />
                  {isOpen && (
                    <div className="ml-1 flex flex-col gap-0.5">
                      {items.map((prompt) => (
                        <PromptRow
                          key={prompt.id}
                          prompt={prompt}
                          writeActionsEnabled={writeActionsEnabled}
                          writeDisabledMessage={writeDisabledMessage}
                          onAdd={onAddToComposer}
                          onEdit={onEditPrompt}
                          onDuplicate={onDuplicatePrompt}
                          onToggleFavorite={onToggleFavorite}
                          onArchive={onArchivePrompt}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-0.5">
        {filtered.map((prompt) => (
          <PromptRow
            key={prompt.id}
            prompt={prompt}
            writeActionsEnabled={writeActionsEnabled}
            writeDisabledMessage={writeDisabledMessage}
            onAdd={onAddToComposer}
            onEdit={onEditPrompt}
            onDuplicate={onDuplicatePrompt}
            onToggleFavorite={onToggleFavorite}
            onArchive={onArchivePrompt}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col border-r border-white/[0.05] bg-[#12181e]">
      <div className="shrink-0 px-3 pb-2 pt-3">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25"
          />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search prompts…"
            className="w-full rounded-lg border border-white/[0.06] bg-[#0f1317] py-1.5 pl-8 pr-8 text-sm text-white/80 placeholder:text-white/25 transition-colors focus:border-white/15 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-1 px-3 pb-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
              tab === item.id
                ? "bg-white/[0.08] text-white/90"
                : "text-white/35 hover:bg-white/[0.04] hover:text-white/60"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="shrink-0 border-b border-white/[0.05] px-3 pb-3">
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortMode)}
            className="h-8 flex-1 rounded-md border border-white/[0.06] bg-[#0f1317] px-2 text-xs text-white/70 focus:border-white/15 focus:outline-none"
          >
            {SORT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {SORT_LABELS[mode]}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFiltersOpen((open) => !open)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
              filtersOpen || hasFilters
                ? "border-indigo-400/35 bg-indigo-500/10 text-indigo-100"
                : "border-white/[0.08] text-white/45 hover:border-white/[0.14] hover:text-white/70"
            }`}
          >
            <SlidersHorizontal size={12} />
            Filters{filterCount(filters) > 0 ? ` · ${filterCount(filters)}` : ""}
          </button>
        </div>

        {filtersOpen && (
          <div className="mt-3 space-y-3 rounded-lg border border-white/[0.06] bg-[#0f1317] p-3">
            <button
              onClick={() =>
                onFiltersChange({
                  tags: [],
                  collections: [],
                  statuses: [],
                  preferredModels: [],
                  outputTypes: [],
                  favoritesOnly: false
                })
              }
              className="text-xs text-white/45 transition-colors hover:text-white/75"
            >
              Clear all filters
            </button>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/35">
                Favorites
              </p>
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    favoritesOnly: !filters.favoritesOnly
                  })
                }
                className={`rounded-full border px-2 py-1 text-[11px] transition-colors ${
                  filters.favoritesOnly
                    ? "border-amber-300/40 bg-amber-400/15 text-amber-100"
                    : "border-white/[0.08] text-white/45 hover:border-white/[0.14] hover:text-white/75"
                }`}
              >
                Favorites only
              </button>
            </div>

            <FilterGroup
              label="Tags"
              options={facets.tags}
              activeValues={filters.tags}
              onToggle={(value) => toggleArrayFilter("tags", value)}
            />
            <FilterGroup
              label="Collection"
              options={facets.collections}
              activeValues={filters.collections}
              onToggle={(value) => toggleArrayFilter("collections", value)}
            />
            <FilterGroup
              label="Status"
              options={facets.statuses}
              activeValues={filters.statuses}
              onToggle={(value) => toggleArrayFilter("statuses", value)}
            />
            <FilterGroup
              label="Model"
              options={facets.preferredModels}
              activeValues={filters.preferredModels}
              onToggle={(value) => toggleArrayFilter("preferredModels", value)}
            />
            <FilterGroup
              label="Output"
              options={facets.outputTypes}
              activeValues={filters.outputTypes}
              onToggle={(value) => toggleArrayFilter("outputTypes", value)}
            />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {!loading && !error && recentItems.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 px-1 py-1.5">
              <Clock size={11} className="text-white/25" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                Recent
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {recentItems.map((prompt) => (
                <PromptRow
                  key={`recent-${prompt.id}`}
                  prompt={prompt}
                  writeActionsEnabled={writeActionsEnabled}
                  writeDisabledMessage={writeDisabledMessage}
                  onAdd={onAddToComposer}
                  onEdit={onEditPrompt}
                  onDuplicate={onDuplicatePrompt}
                  onToggleFavorite={onToggleFavorite}
                  onArchive={onArchivePrompt}
                />
              ))}
            </div>
            <div className="my-2 border-t border-white/[0.05]" />
          </div>
        )}

        {renderContent()}
      </div>

      <div className="shrink-0 border-t border-white/[0.05] px-3 py-2.5">
        <button
          onClick={onNewPrompt}
          disabled={!writeActionsEnabled}
          title={writeActionsEnabled ? "New prompt" : writeDisabledMessage}
          className={`flex w-full items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition-all ${
            writeActionsEnabled
              ? "border-transparent text-white/40 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white/70"
              : "cursor-not-allowed border-white/[0.03] text-white/20"
          }`}
        >
          <Plus size={13} />
          New Prompt
        </button>
      </div>
    </div>
  );
}
