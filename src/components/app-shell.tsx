"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";

import { CommandPalette } from "@/components/command-palette";
import { EmptyState } from "@/components/empty-state";
import { MobileFilterSheet } from "@/components/mobile-filter-sheet";
import { PromptComposer } from "@/components/prompt-composer";
import { PromptDetailPane } from "@/components/prompt-detail-pane";
import { PromptEditor } from "@/components/prompt-editor";
import { PromptList } from "@/components/prompt-list";
import { Sidebar } from "@/components/sidebar";
import { TopToolbar } from "@/components/top-toolbar";
import { Button } from "@/components/ui/button";
import {
  createInitialState,
  defaultFilters,
  filterPrompts,
  getFacetOptions,
  loadState,
  persistState,
  sortPrompts
} from "@/lib/prompt-store";
import { PromptFilters, PromptItem, PromptScope, WorkspaceState } from "@/types/prompt";

function toggleFilterValue(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export function AppShell(){
  const [state, setState] = useState<WorkspaceState>(createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [composerIds, setComposerIds] = useState<string[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerVars, setComposerVars] = useState<Record<string, string>>({});
  const [composedDraft, setComposedDraft] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadedState = loadState();
    setState(loadedState);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    persistState(state);
  }, [state, hydrated]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (event.key.toLowerCase() === "n" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        openCreatePrompt();
      }
      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
        setMobileFiltersOpen(false);
        setMobileDetailOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!copyFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => setCopyFeedback(""), 1400);
    return () => window.clearTimeout(timeout);
  }, [copyFeedback]);

  const filteredPrompts = useMemo(() => sortPrompts(filterPrompts(state), state.sort), [state]);

  useEffect(() => {
    if (filteredPrompts.length === 0) {
      return;
    }

    if (!state.selectedPromptId || !filteredPrompts.some((prompt) => prompt.id === state.selectedPromptId)) {
      setState((prev) => ({ ...prev, selectedPromptId: filteredPrompts[0].id }));
    }
  }, [filteredPrompts, state.selectedPromptId]);

  const selectedPrompt = useMemo(
    () => state.prompts.find((prompt) => prompt.id === state.selectedPromptId) ?? null,
    [state.prompts, state.selectedPromptId]
  );

  const filterOptions = useMemo(() => getFacetOptions(state.prompts), [state.prompts]);

  const updatePromptList = (updater: (prompts: PromptItem[]) => PromptItem[]): void => {
    setState((prev) => ({
      ...prev,
      prompts: updater(prev.prompts)
    }));
  };

  const onScopeChange = (scope: PromptScope): void => {
    setState((prev) => ({ ...prev, scope }));
    setSidebarOpen(false);
  };

  const onToggleFilter = (key: keyof PromptFilters, value: string): void => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: toggleFilterValue(prev.filters[key], value)
      } as PromptFilters
    }));
  };

  const onSelectPrompt = (promptId: string): void => {
    setState((prev) => ({ ...prev, selectedPromptId: promptId }));
    setMobileDetailOpen(true);
  };

  const copySelected = async (): Promise<void> => {
    if (!selectedPrompt) {
      return;
    }

    await navigator.clipboard.writeText(selectedPrompt.body);
    setCopyFeedback("Copied prompt body to clipboard");
    updatePromptList((prompts) =>
      prompts.map((prompt) =>
        prompt.id === selectedPrompt.id
          ? {
              ...prompt,
              lastUsedAt: new Date().toISOString(),
              useCount: prompt.useCount + 1
            }
          : prompt
      )
    );
  };

  const duplicateSelected = (): void => {
    if (!selectedPrompt) {
      return;
    }

    const now = new Date().toISOString();
    const duplicated: PromptItem = {
      ...selectedPrompt,
      id: `prompt-${Math.random().toString(36).slice(2, 9)}`,
      title: `${selectedPrompt.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: now,
      useCount: 0,
      versions: [
        ...selectedPrompt.versions,
        {
          id: `v-${Date.now()}`,
          body: selectedPrompt.body,
          updatedAt: now,
          note: "Duplicated"
        }
      ]
    };

    setState((prev) => ({
      ...prev,
      prompts: [duplicated, ...prev.prompts],
      selectedPromptId: duplicated.id
    }));
  };

  const toggleFavoriteSelected = (): void => {
    if (!selectedPrompt) {
      return;
    }

    updatePromptList((prompts) =>
      prompts.map((prompt) =>
        prompt.id === selectedPrompt.id ? { ...prompt, favorite: !prompt.favorite } : prompt
      )
    );
  };

  const archiveSelected = (): void => {
    if (!selectedPrompt) {
      return;
    }

    updatePromptList((prompts) =>
      prompts.map((prompt) =>
        prompt.id === selectedPrompt.id
          ? { ...prompt, status: "archived", updatedAt: new Date().toISOString() }
          : prompt
      )
    );
  };

  const openCreatePrompt = (): void => {
    setComposedDraft(undefined);
    setEditingPrompt(null);
    setEditorOpen(true);
  };

  const addToComposer = (id: string): void => {
    setComposerIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setComposerOpen(true);
  };

  const removeFromComposer = (id: string): void => {
    setComposerIds((prev) => prev.filter((x) => x !== id));
  };

  const clearComposer = (): void => {
    setComposerIds([]);
    setComposerVars({});
    setComposerOpen(false);
  };

  const openSaveComposed = (body: string): void => {
    setComposedDraft(body);
    setEditingPrompt(null);
    setEditorOpen(true);
  };

  const openEditPrompt = (): void => {
    if (!selectedPrompt) {
      return;
    }
    setEditingPrompt(selectedPrompt);
    setEditorOpen(true);
  };

  const savePrompt = (
    payload: Omit<PromptItem, "id" | "createdAt" | "updatedAt" | "lastUsedAt" | "useCount" | "versions">
  ): void => {
    const now = new Date().toISOString();

    if (editingPrompt) {
      updatePromptList((prompts) =>
        prompts.map((prompt) =>
          prompt.id === editingPrompt.id
            ? {
                ...prompt,
                ...payload,
                updatedAt: now,
                versions: [
                  {
                    id: `v-${Date.now()}`,
                    body: prompt.body,
                    updatedAt: now,
                    note: "Edited"
                  },
                  ...prompt.versions
                ]
              }
            : prompt
        )
      );
      setState((prev) => ({ ...prev, selectedPromptId: editingPrompt.id }));
    } else {
      const created: PromptItem = {
        id: `prompt-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now,
        useCount: 0,
        versions: [
          {
            id: `v-${Date.now()}`,
            body: payload.body,
            updatedAt: now,
            note: "Initial"
          }
        ],
        ...payload
      };
      setState((prev) => ({
        ...prev,
        prompts: [created, ...prev.prompts],
        selectedPromptId: created.id
      }));
    }

    setEditorOpen(false);
    setEditingPrompt(null);
  };

  const smartViews = [
    {
      id: "high-usage",
      label: "High Usage",
      action: () => {
        setState((prev) => ({
          ...prev,
          sort: "most-used",
          query: "",
          scope: "all"
        }));
      }
    },
    {
      id: "drafts-needing-work",
      label: "Drafts Needing Work",
      action: () => {
        setState((prev) => ({
          ...prev,
          scope: "drafts",
          filters: defaultFilters,
          query: ""
        }));
      }
    },
    {
      id: "research-pack",
      label: "Research Pack",
      action: () => {
        setState((prev) => ({
          ...prev,
          filters: {
            ...defaultFilters,
            tags: ["research"]
          },
          scope: "all"
        }));
      }
    }
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="hidden md:block">
        <Sidebar scope={state.scope} onScopeChange={onScopeChange} smartViews={smartViews} />
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="h-full w-64" onClick={(event) => event.stopPropagation()}>
            <Sidebar scope={state.scope} onScopeChange={onScopeChange} smartViews={smartViews} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopToolbar
          query={state.query}
          onQueryChange={(query) => setState((prev) => ({ ...prev, query }))}
          filters={state.filters}
          filterOptions={filterOptions}
          onToggleFilter={onToggleFilter}
          onClearFilters={() => setState((prev) => ({ ...prev, filters: defaultFilters }))}
          sort={state.sort}
          onSortChange={(sort) => setState((prev) => ({ ...prev, sort }))}
          view={state.view}
          onViewChange={(view) => setState((prev) => ({ ...prev, view }))}
          onNewPrompt={openCreatePrompt}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        />

        <main className="flex min-h-0 flex-1">
          <section className="relative min-w-0 flex-1 overflow-y-auto border-r border-border/70 bg-[#12181e]">
            <div className="absolute left-2 top-2 z-10 md:hidden">
              <Button size="icon" variant="outline" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            {filteredPrompts.length ? (
              <PromptList
                prompts={filteredPrompts}
                selectedPromptId={state.selectedPromptId}
                view={state.view}
                onSelectPrompt={onSelectPrompt}
                composerIds={composerIds}
                onAddToComposer={addToComposer}
              />
            ) : (
              <EmptyState
                onReset={() => setState((prev) => ({ ...prev, query: "", filters: defaultFilters, scope: "all" }))}
              />
            )}
          </section>

          <div className="hidden w-[44%] min-w-[360px] xl:block">
            <PromptDetailPane
              prompt={selectedPrompt}
              onCopy={copySelected}
              onDuplicate={duplicateSelected}
              onToggleFavorite={toggleFavoriteSelected}
              onArchive={archiveSelected}
              onEdit={openEditPrompt}
              copyFeedback={copyFeedback}
            />
          </div>
        </main>

        <PromptComposer
          open={composerOpen}
          onToggle={() => setComposerOpen((o) => !o)}
          ids={composerIds}
          prompts={state.prompts}
          vars={composerVars}
          onVarChange={(k, v) => setComposerVars((prev) => ({ ...prev, [k]: v }))}
          onRemove={removeFromComposer}
          onReorder={setComposerIds}
          onClear={clearComposer}
          onSaveAsNew={openSaveComposed}
        />
      </div>

      {mobileDetailOpen && selectedPrompt ? (
        <div className="fixed inset-0 z-40 bg-black/70 xl:hidden">
          <PromptDetailPane
            prompt={selectedPrompt}
            onCopy={copySelected}
            onDuplicate={duplicateSelected}
            onToggleFavorite={toggleFavoriteSelected}
            onArchive={archiveSelected}
            onEdit={openEditPrompt}
            copyFeedback={copyFeedback}
            mobile
            onCloseMobile={() => setMobileDetailOpen(false)}
          />
        </div>
      ) : null}

      <PromptEditor
        open={editorOpen}
        prompt={editingPrompt}
        initialBody={composedDraft}
        onClose={() => {
          setEditorOpen(false);
          setEditingPrompt(null);
          setComposedDraft(undefined);
        }}
        onSave={savePrompt}
      />

      <CommandPalette
        open={commandPaletteOpen}
        prompts={state.prompts}
        selectedPrompt={selectedPrompt}
        onClose={() => setCommandPaletteOpen(false)}
        onJumpToPrompt={(promptId) => {
          setState((prev) => ({ ...prev, selectedPromptId: promptId }));
          setMobileDetailOpen(true);
        }}
        onCreatePrompt={openCreatePrompt}
        onDuplicateSelected={duplicateSelected}
        onToggleFavoriteSelected={toggleFavoriteSelected}
      />

      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={state.filters}
        options={filterOptions}
        onToggleFilter={onToggleFilter}
        onClearFilters={() => setState((prev) => ({ ...prev, filters: defaultFilters }))}
        sort={state.sort}
        onSortChange={(sort) => setState((prev) => ({ ...prev, sort }))}
        view={state.view}
        onViewChange={(view) => setState((prev) => ({ ...prev, view }))}
      />
    </div>
  );
}
