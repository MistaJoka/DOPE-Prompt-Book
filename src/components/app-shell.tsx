"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { CommandPalette } from "@/components/command-palette";
import { ComposerCanvas } from "@/components/composer-canvas";
import { LibraryDrawer } from "@/components/library-drawer";
import { PromptEditor } from "@/components/prompt-editor";
import { reorderComposerBlocks } from "@/lib/composer";
import {
  archivePrompt as archivePromptRequest,
  createPrompt,
  duplicatePrompt as duplicatePromptRequest,
  fetchPromptDefinitions,
  updatePrompt
} from "@/lib/prompt-client";
import {
  createInitialWorkspaceState,
  loadWorkspaceState,
  mergePromptDefinitions,
  persistWorkspaceState
} from "@/lib/prompt-store";
import {
  PORTFOLIO_URL,
  PromptRuntimeConfig
} from "@/lib/prompt-runtime";
import {
  ComposerBlock,
  LibraryFilters,
  LibraryTab,
  PromptDefinition,
  PromptMutationInput,
  PromptRecord,
  SortMode,
  WorkspaceState
} from "@/types/prompt";

function makeBlock(prompt: PromptRecord): ComposerBlock {
  return {
    instanceId: `${prompt.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    promptId: prompt.id,
    title: prompt.title,
    category: prompt.category,
    subcategory: prompt.subcategory,
    body: prompt.body,
    isExpanded: false
  };
}

function toMutationInput(prompt: PromptDefinition | PromptRecord): PromptMutationInput {
  return {
    title: prompt.title,
    summary: prompt.summary,
    body: prompt.body,
    tags: prompt.tags,
    collection: prompt.collection,
    variables: prompt.variables,
    outputType: prompt.outputType,
    preferredModel: prompt.preferredModel,
    favorite: prompt.favorite,
    status: prompt.status,
    category: prompt.category,
    subcategory: prompt.subcategory
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

type AppShellProps = {
  runtimeConfig: PromptRuntimeConfig;
};

export function AppShell({ runtimeConfig }: AppShellProps) {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>(
    createInitialWorkspaceState()
  );
  const [promptDefinitions, setPromptDefinitions] = useState<PromptDefinition[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [focusSearchSignal, setFocusSearchSignal] = useState(0);
  const writeDisabledMessage =
    runtimeConfig.writeDisabledMessage ?? "Prompt library changes are disabled.";

  useEffect(() => {
    setWorkspaceState(loadWorkspaceState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    persistWorkspaceState(workspaceState);
  }, [workspaceState, hydrated]);

  const loadPrompts = useCallback(async () => {
    setLoadingPrompts(true);
    setLoadError(null);

    try {
      const prompts = await fetchPromptDefinitions();
      setPromptDefinitions(prompts);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoadingPrompts(false);
    }
  }, []);

  useEffect(() => {
    void loadPrompts();
  }, [loadPrompts]);

  const prompts = useMemo(
    () => mergePromptDefinitions(promptDefinitions, workspaceState.promptUsage),
    [promptDefinitions, workspaceState.promptUsage]
  );
  const editingPrompt = useMemo(
    () =>
      editingPromptId
        ? promptDefinitions.find((prompt) => prompt.id === editingPromptId) ?? null
        : null,
    [editingPromptId, promptDefinitions]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      const tag = (event.target as HTMLElement).tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      if (event.key === "/" && !inInput && !commandPaletteOpen) {
        event.preventDefault();
        setWorkspaceState((previous) => ({ ...previous, libraryDrawerOpen: true }));
        setFocusSearchSignal((value) => value + 1);
        return;
      }

      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
        return;
      }

      if (meta && event.key === "Backspace" && !inInput) {
        event.preventDefault();
        setWorkspaceState((previous) => ({
          ...previous,
          composerBlocks: previous.composerBlocks.slice(0, -1)
        }));
        return;
      }

      if (meta && event.shiftKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        if (!runtimeConfig.writeActionsEnabled) {
          setActionError(writeDisabledMessage);
          return;
        }

        setEditingPromptId(null);
        setEditorOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandPaletteOpen, runtimeConfig.writeActionsEnabled, writeDisabledMessage]);

  const upsertPromptDefinition = useCallback((prompt: PromptDefinition) => {
    setPromptDefinitions((previous) => {
      const existingIndex = previous.findIndex((candidate) => candidate.id === prompt.id);

      if (existingIndex === -1) {
        return [prompt, ...previous];
      }

      return previous.map((candidate) => (candidate.id === prompt.id ? prompt : candidate));
    });
  }, []);

  const addToComposer = useCallback((prompt: PromptRecord) => {
    const now = new Date().toISOString();

    setWorkspaceState((previous) => {
      const usage = previous.promptUsage[prompt.id] ?? { useCount: 0, lastUsedAt: null };

      return {
        ...previous,
        promptUsage: {
          ...previous.promptUsage,
          [prompt.id]: {
            lastUsedAt: now,
            useCount: usage.useCount + 1
          }
        },
        composerBlocks: [...previous.composerBlocks, makeBlock(prompt)]
      };
    });
  }, []);

  const toggleExpand = useCallback((instanceId: string) => {
    setWorkspaceState((previous) => ({
      ...previous,
      composerBlocks: previous.composerBlocks.map((block) =>
        block.instanceId === instanceId
          ? { ...block, isExpanded: !block.isExpanded }
          : block
      )
    }));
  }, []);

  const removeBlock = useCallback((instanceId: string) => {
    setWorkspaceState((previous) => ({
      ...previous,
      composerBlocks: previous.composerBlocks.filter(
        (block) => block.instanceId !== instanceId
      )
    }));
  }, []);

  const updateBlockBody = useCallback((instanceId: string, body: string) => {
    setWorkspaceState((previous) => ({
      ...previous,
      composerBlocks: previous.composerBlocks.map((block) =>
        block.instanceId === instanceId ? { ...block, body } : block
      )
    }));
  }, []);

  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    setWorkspaceState((previous) => ({
      ...previous,
      composerBlocks: reorderComposerBlocks(previous.composerBlocks, fromIndex, toIndex)
    }));
  }, []);

  const clearComposer = useCallback(() => {
    setWorkspaceState((previous) => ({ ...previous, composerBlocks: [] }));
  }, []);

  const savePrompt = useCallback(
    async (payload: PromptMutationInput) => {
      if (!runtimeConfig.writeActionsEnabled) {
        throw new Error(writeDisabledMessage);
      }

      const prompt = editingPrompt
        ? await updatePrompt(editingPrompt.id, payload)
        : await createPrompt(payload);

      upsertPromptDefinition(prompt);
      setEditorOpen(false);
      setEditingPromptId(null);
      setActionError(null);
    },
    [editingPrompt, runtimeConfig.writeActionsEnabled, upsertPromptDefinition, writeDisabledMessage]
  );

  const openEditPrompt = useCallback((prompt: PromptRecord) => {
    if (!runtimeConfig.writeActionsEnabled) {
      setActionError(writeDisabledMessage);
      return;
    }

    setEditingPromptId(prompt.id);
    setEditorOpen(true);
  }, [runtimeConfig.writeActionsEnabled, writeDisabledMessage]);

  const openNewPrompt = useCallback(() => {
    if (!runtimeConfig.writeActionsEnabled) {
      setActionError(writeDisabledMessage);
      return;
    }

    setEditingPromptId(null);
    setEditorOpen(true);
  }, [runtimeConfig.writeActionsEnabled, writeDisabledMessage]);

  const handleDuplicatePrompt = useCallback(async (prompt: PromptRecord) => {
    if (!runtimeConfig.writeActionsEnabled) {
      setActionError(writeDisabledMessage);
      return;
    }

    try {
      const duplicatedPrompt = await duplicatePromptRequest(prompt.id);
      upsertPromptDefinition(duplicatedPrompt);
      setEditingPromptId(duplicatedPrompt.id);
      setEditorOpen(true);
      setActionError(null);
    } catch (error) {
      setActionError(errorMessage(error));
    }
  }, [runtimeConfig.writeActionsEnabled, upsertPromptDefinition, writeDisabledMessage]);

  const handleArchivePrompt = useCallback(async (prompt: PromptRecord) => {
    if (!runtimeConfig.writeActionsEnabled) {
      setActionError(writeDisabledMessage);
      return;
    }

    try {
      const archivedPrompt = await archivePromptRequest(prompt.id);
      upsertPromptDefinition(archivedPrompt);
      setActionError(null);
    } catch (error) {
      setActionError(errorMessage(error));
    }
  }, [runtimeConfig.writeActionsEnabled, upsertPromptDefinition, writeDisabledMessage]);

  const handleToggleFavorite = useCallback(async (prompt: PromptRecord) => {
    if (!runtimeConfig.writeActionsEnabled) {
      setActionError(writeDisabledMessage);
      return;
    }

    try {
      const updatedPrompt = await updatePrompt(prompt.id, {
        ...toMutationInput(prompt),
        favorite: !prompt.favorite
      });

      upsertPromptDefinition(updatedPrompt);
      setActionError(null);
    } catch (error) {
      setActionError(errorMessage(error));
    }
  }, [runtimeConfig.writeActionsEnabled, upsertPromptDefinition, writeDisabledMessage]);

  const setLibraryTab = useCallback((tab: LibraryTab) => {
    setWorkspaceState((previous) => ({ ...previous, libraryTab: tab }));
  }, []);

  const setLibrarySearch = useCallback((search: string) => {
    setWorkspaceState((previous) => ({ ...previous, librarySearch: search }));
  }, []);

  const setSort = useCallback((sort: SortMode) => {
    setWorkspaceState((previous) => ({ ...previous, sort }));
  }, []);

  const setFilters = useCallback((filters: LibraryFilters) => {
    setWorkspaceState((previous) => ({ ...previous, filters }));
  }, []);

  const toggleDrawer = useCallback(() => {
    setWorkspaceState((previous) => ({
      ...previous,
      libraryDrawerOpen: !previous.libraryDrawerOpen
    }));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1317] text-white">
      <div className="absolute left-0 right-0 top-0 z-10 flex h-10 items-center gap-2 border-b border-white/[0.04] bg-[#0f1317] px-3">
        <button
          onClick={toggleDrawer}
          className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.05] hover:text-white/60"
          title={workspaceState.libraryDrawerOpen ? "Close library" : "Open library"}
        >
          {workspaceState.libraryDrawerOpen ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeftOpen size={16} />
          )}
        </button>
        <span className="select-none text-xs font-semibold uppercase tracking-widest text-white/20">
          DOPE
        </span>
        {runtimeConfig.isReadOnlyDemo && runtimeConfig.demoBadgeText && (
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/45">
            {runtimeConfig.demoBadgeText}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-white/25 transition-colors hover:text-white/50"
          >
            Portfolio
          </a>
          <span className="hidden text-[11px] text-white/25 sm:inline">
            {loadingPrompts ? "Loading library..." : `${promptDefinitions.length} prompts`}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 pt-10">
        {workspaceState.libraryDrawerOpen && (
          <div className="h-full w-80 shrink-0 overflow-hidden">
            <LibraryDrawer
              prompts={prompts}
              loading={loadingPrompts}
              error={loadError}
              tab={workspaceState.libraryTab}
              search={workspaceState.librarySearch}
              sort={workspaceState.sort}
              filters={workspaceState.filters}
              focusSearchSignal={focusSearchSignal}
              onTabChange={setLibraryTab}
              onSearchChange={setLibrarySearch}
              onSortChange={setSort}
              onFiltersChange={setFilters}
              onAddToComposer={addToComposer}
              onEditPrompt={openEditPrompt}
              onDuplicatePrompt={handleDuplicatePrompt}
              onToggleFavorite={handleToggleFavorite}
              onArchivePrompt={handleArchivePrompt}
              onNewPrompt={openNewPrompt}
              writeActionsEnabled={runtimeConfig.writeActionsEnabled}
              writeDisabledMessage={writeDisabledMessage}
              onRetry={loadPrompts}
            />
          </div>
        )}

        <div className="min-w-0 flex-1 overflow-hidden">
          <ComposerCanvas
            blocks={workspaceState.composerBlocks}
            onToggleExpand={toggleExpand}
            onRemove={removeBlock}
            onBodyChange={updateBlockBody}
            onReorder={reorderBlocks}
            onClearAll={clearComposer}
          />
        </div>
      </div>

      {(actionError || (!workspaceState.libraryDrawerOpen && loadError)) && (
        <div className="absolute right-4 top-14 z-10 flex items-center gap-2 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertCircle size={13} />
          {actionError ?? loadError}
        </div>
      )}

      <PromptEditor
        open={editorOpen}
        prompt={editingPrompt}
        onClose={() => {
          setEditorOpen(false);
          setEditingPromptId(null);
        }}
        onSave={savePrompt}
      />

      <CommandPalette
        open={commandPaletteOpen}
        prompts={prompts}
        onClose={() => setCommandPaletteOpen(false)}
        onAddToComposer={addToComposer}
        onNewPrompt={openNewPrompt}
        writeActionsEnabled={runtimeConfig.writeActionsEnabled}
        writeDisabledMessage={writeDisabledMessage}
      />
    </div>
  );
}
