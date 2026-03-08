"use client";

import { useCallback, useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { CommandPalette } from "@/components/command-palette";
import { ComposerCanvas } from "@/components/composer-canvas";
import { LibraryDrawer } from "@/components/library-drawer";
import { PromptEditor } from "@/components/prompt-editor";
import {
  createInitialState,
  loadState,
  persistState
} from "@/lib/prompt-store";
import {
  ComposerBlock,
  LibraryTab,
  PromptItem,
  WorkspaceState
} from "@/types/prompt";

function makeBlock(prompt: PromptItem): ComposerBlock {
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

export function AppShell() {
  const [state, setState] = useState<WorkspaceState>(createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  // Signal to focus library search (incrementing triggers the effect in LibraryDrawer)
  const [focusSearchSignal, setFocusSearchSignal] = useState(0);

  // Load persisted state on mount
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!hydrated) return;
    persistState(state);
  }, [state, hydrated]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Cmd+K — open command palette
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // / — focus library search (when not in an input)
      if (e.key === "/" && !inInput && !commandPaletteOpen) {
        e.preventDefault();
        // Open drawer if closed, then focus search
        setState((prev) => ({ ...prev, libraryDrawerOpen: true }));
        setFocusSearchSignal((n) => n + 1);
        return;
      }

      // Escape — clear command palette or close it
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        return;
      }

      // Cmd+Backspace — remove last composer block
      if (meta && e.key === "Backspace" && !inInput) {
        e.preventDefault();
        setState((prev) => ({
          ...prev,
          composerBlocks: prev.composerBlocks.slice(0, -1)
        }));
        return;
      }

      // Cmd+Shift+M — open new prompt editor
      if (meta && e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setEditingPrompt(null);
        setEditorOpen(true);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandPaletteOpen]);

  // ── Composer actions ────────────────────────────────────────────────────
  const addToComposer = useCallback((prompt: PromptItem) => {
    setState((prev) => ({
      ...prev,
      prompts: prev.prompts.map((p) =>
        p.id === prompt.id
          ? { ...p, lastUsedAt: new Date().toISOString(), useCount: p.useCount + 1 }
          : p
      ),
      composerBlocks: [...prev.composerBlocks, makeBlock(prompt)]
    }));
  }, []);

  const toggleExpand = useCallback((instanceId: string) => {
    setState((prev) => ({
      ...prev,
      composerBlocks: prev.composerBlocks.map((b) =>
        b.instanceId === instanceId ? { ...b, isExpanded: !b.isExpanded } : b
      )
    }));
  }, []);

  const removeBlock = useCallback((instanceId: string) => {
    setState((prev) => ({
      ...prev,
      composerBlocks: prev.composerBlocks.filter((b) => b.instanceId !== instanceId)
    }));
  }, []);

  const updateBlockBody = useCallback((instanceId: string, body: string) => {
    setState((prev) => ({
      ...prev,
      composerBlocks: prev.composerBlocks.map((b) =>
        b.instanceId === instanceId ? { ...b, body } : b
      )
    }));
  }, []);

  const reorderBlocks = useCallback((from: number, to: number) => {
    setState((prev) => {
      const blocks = [...prev.composerBlocks];
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      return { ...prev, composerBlocks: blocks };
    });
  }, []);

  const clearComposer = useCallback(() => {
    setState((prev) => ({ ...prev, composerBlocks: [] }));
  }, []);

  // ── Prompt management ───────────────────────────────────────────────────
  const archivePrompt = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      prompts: prev.prompts.map((p) =>
        p.id === id ? { ...p, status: "archived", updatedAt: new Date().toISOString() } : p
      )
    }));
  }, []);

  const savePrompt = useCallback(
    (payload: Omit<PromptItem, "id" | "createdAt" | "updatedAt" | "lastUsedAt" | "useCount" | "versions">) => {
      const now = new Date().toISOString();

      if (editingPrompt) {
        setState((prev) => ({
          ...prev,
          prompts: prev.prompts.map((p) =>
            p.id === editingPrompt.id
              ? {
                  ...p,
                  ...payload,
                  updatedAt: now,
                  versions: [
                    { id: `v-${Date.now()}`, body: p.body, updatedAt: now, note: "Edited" },
                    ...p.versions
                  ]
                }
              : p
          )
        }));
      } else {
        const created: PromptItem = {
          id: `prompt-${Math.random().toString(36).slice(2, 9)}`,
          createdAt: now,
          updatedAt: now,
          lastUsedAt: now,
          useCount: 0,
          versions: [{ id: `v-${Date.now()}`, body: payload.body, updatedAt: now, note: "Initial" }],
          ...payload
        };
        setState((prev) => ({ ...prev, prompts: [created, ...prev.prompts] }));
      }

      setEditorOpen(false);
      setEditingPrompt(null);
    },
    [editingPrompt]
  );

  const openEditPrompt = useCallback((prompt: PromptItem) => {
    setEditingPrompt(prompt);
    setEditorOpen(true);
  }, []);

  const openNewPrompt = useCallback(() => {
    setEditingPrompt(null);
    setEditorOpen(true);
  }, []);

  // ── Library drawer state ────────────────────────────────────────────────
  const setLibraryTab = useCallback((tab: LibraryTab) => {
    setState((prev) => ({ ...prev, libraryTab: tab }));
  }, []);

  const setLibrarySearch = useCallback((search: string) => {
    setState((prev) => ({ ...prev, librarySearch: search }));
  }, []);

  const toggleDrawer = useCallback(() => {
    setState((prev) => ({ ...prev, libraryDrawerOpen: !prev.libraryDrawerOpen }));
  }, []);

  return (
    <div className="flex h-screen bg-[#0f1317] text-white overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-10 flex items-center px-3 gap-2 z-10 border-b border-white/[0.04] bg-[#0f1317]">
        <button
          onClick={toggleDrawer}
          className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
          title={state.libraryDrawerOpen ? "Close library" : "Open library"}
        >
          {state.libraryDrawerOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
        <span className="text-xs font-semibold tracking-widest text-white/20 uppercase select-none">
          DOPE
        </span>
      </div>

      {/* Main content below topbar */}
      <div className="flex flex-1 min-h-0 pt-10">
        {/* Library Drawer */}
        {state.libraryDrawerOpen && (
          <div className="w-72 shrink-0 h-full overflow-hidden">
            <LibraryDrawer
              prompts={state.prompts}
              tab={state.libraryTab}
              search={state.librarySearch}
              focusSearchSignal={focusSearchSignal}
              onTabChange={setLibraryTab}
              onSearchChange={setLibrarySearch}
              onAddToComposer={addToComposer}
              onEditPrompt={openEditPrompt}
              onArchivePrompt={archivePrompt}
              onNewPrompt={openNewPrompt}
            />
          </div>
        )}

        {/* Composer Canvas */}
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <ComposerCanvas
            blocks={state.composerBlocks}
            onToggleExpand={toggleExpand}
            onRemove={removeBlock}
            onBodyChange={updateBlockBody}
            onReorder={reorderBlocks}
            onClearAll={clearComposer}
          />
        </div>
      </div>

      {/* Prompt Editor modal */}
      <PromptEditor
        open={editorOpen}
        prompt={editingPrompt}
        onClose={() => {
          setEditorOpen(false);
          setEditingPrompt(null);
        }}
        onSave={savePrompt}
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        prompts={state.prompts}
        onClose={() => setCommandPaletteOpen(false)}
        onAddToComposer={addToComposer}
        onNewPrompt={openNewPrompt}
      />
    </div>
  );
}
