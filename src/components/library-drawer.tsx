"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  X
} from "lucide-react";
import {
  LibraryTab,
  PromptItem,
  SnipSubcategory
} from "@/types/prompt";
import {
  categoryLabel,
  getLibraryItems,
  getRecentlyUsed,
  groupRecipesByCollection,
  groupSnipsBySubcategory
} from "@/lib/prompt-store";

const SNIP_ORDER: SnipSubcategory[] = ["role", "tone", "output", "rules"];

const TABS: { id: LibraryTab; label: string }[] = [
  { id: "snips", label: "Snips" },
  { id: "recipes", label: "Recipes" },
  { id: "kits", label: "Kits" }
];

interface LibraryDrawerProps {
  prompts: PromptItem[];
  tab: LibraryTab;
  search: string;
  focusSearchSignal: number;
  onTabChange: (tab: LibraryTab) => void;
  onSearchChange: (value: string) => void;
  onAddToComposer: (prompt: PromptItem) => void;
  onEditPrompt: (prompt: PromptItem) => void;
  onArchivePrompt: (id: string) => void;
  onNewPrompt: () => void;
}

interface ContextMenu {
  promptId: string;
  x: number;
  y: number;
}

function PromptRow({
  prompt,
  onAdd,
  onContextMenu
}: {
  prompt: PromptItem;
  onAdd: (p: PromptItem) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAdd(prompt);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 800);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleAdd}
      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      onContextMenu={(e) => onContextMenu(e, prompt.id)}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group relative cursor-pointer select-none ${
        justAdded
          ? "bg-indigo-600/20 border border-indigo-500/30"
          : "hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate transition-colors ${
            justAdded ? "text-indigo-300" : "text-white/80 group-hover:text-white"
          }`}>
            {prompt.title}
          </p>
          <p className="text-xs text-white/35 truncate mt-0.5">{prompt.summary}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, prompt.id);
          }}
          className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
          title="Options"
        >
          <MoreHorizontal size={13} />
        </button>
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
      className="w-full flex items-center gap-1.5 px-1 py-1.5 text-left group"
    >
      {isOpen ? (
        <ChevronDown size={12} className="text-white/30 group-hover:text-white/50 transition-colors" />
      ) : (
        <ChevronRight size={12} className="text-white/30 group-hover:text-white/50 transition-colors" />
      )}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
        {label}
      </span>
      <span className="text-[10px] text-white/25 ml-auto">{count}</span>
    </button>
  );
}

export function LibraryDrawer({
  prompts,
  tab,
  search,
  focusSearchSignal,
  onTabChange,
  onSearchChange,
  onAddToComposer,
  onEditPrompt,
  onArchivePrompt,
  onNewPrompt
}: LibraryDrawerProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Focus search when signal fires
  useEffect(() => {
    if (focusSearchSignal > 0) {
      searchRef.current?.focus();
      searchRef.current?.select();
    }
  }, [focusSearchSignal]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, promptId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ promptId, x: e.clientX, y: e.clientY });
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = getLibraryItems(prompts, tab, search);
  const recentItems = !search ? getRecentlyUsed(prompts) : [];
  const contextPrompt = contextMenu
    ? prompts.find((p) => p.id === contextMenu.promptId)
    : null;

  const renderContent = () => {
    if (filtered.length === 0 && search) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-2">
          <p className="text-white/30 text-sm">No results for &ldquo;{search}&rdquo;</p>
        </div>
      );
    }

    if (tab === "snips") {
      const groups = groupSnipsBySubcategory(filtered);
      return (
        <div className="flex flex-col gap-1">
          {SNIP_ORDER.map((sub) => {
            const items = groups[sub];
            if (!items.length) return null;
            const sectionKey = `snip-${sub}`;
            const isOpen = !collapsedSections.has(sectionKey);
            return (
              <div key={sub}>
                <SectionHeader
                  label={sub.charAt(0).toUpperCase() + sub.slice(1)}
                  count={items.length}
                  isOpen={isOpen}
                  onToggle={() => toggleSection(sectionKey)}
                />
                {isOpen && (
                  <div className="flex flex-col gap-0.5 ml-1">
                    {items.map((p) => (
                      <PromptRow
                        key={p.id}
                        prompt={p}
                        onAdd={onAddToComposer}
                        onContextMenu={handleContextMenu}
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
            .sort(([a], [b]) => a.localeCompare(b))
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
                    <div className="flex flex-col gap-0.5 ml-1">
                      {items.map((p) => (
                        <PromptRow
                          key={p.id}
                          prompt={p}
                          onAdd={onAddToComposer}
                          onContextMenu={handleContextMenu}
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

    // Kits — flat list
    return (
      <div className="flex flex-col gap-0.5">
        {filtered.map((p) => (
          <PromptRow
            key={p.id}
            prompt={p}
            onAdd={onAddToComposer}
            onContextMenu={handleContextMenu}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-white/25 text-sm px-3 py-4 text-center">No kits yet</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#12181e] border-r border-white/[0.05]">
      {/* Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search pieces…"
            className="w-full bg-[#0f1317] border border-white/[0.06] rounded-lg pl-8 pr-8 py-1.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/15 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pb-2 gap-1 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex-1 py-1 rounded-md text-xs font-medium transition-all ${
              tab === t.id
                ? "bg-white/[0.08] text-white/90"
                : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-2">
        {/* Recently used section (only when search is empty) */}
        {!search && recentItems.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 px-1 py-1.5">
              <Clock size={11} className="text-white/25" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                Recent
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {recentItems.map((p) => (
                <PromptRow
                  key={`recent-${p.id}`}
                  prompt={p}
                  onAdd={onAddToComposer}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
            <div className="my-2 border-t border-white/[0.05]" />
          </div>
        )}

        {renderContent()}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-3 py-2.5 border-t border-white/[0.05]">
        <button
          onClick={onNewPrompt}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.06]"
        >
          <Plus size={13} />
          New Prompt
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && contextPrompt && (
        <div
          className="fixed z-50 bg-[#1e2832] border border-white/[0.08] rounded-lg shadow-2xl py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-white/[0.06] mb-1">
            <p className="text-xs font-medium text-white/50 truncate max-w-[150px]">
              {contextPrompt.title}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5">
              {categoryLabel(contextPrompt.category, contextPrompt.subcategory)}
            </p>
          </div>
          <button
            onClick={() => {
              onAddToComposer(contextPrompt);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Add to composer
          </button>
          <button
            onClick={() => {
              onEditPrompt(contextPrompt);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onArchivePrompt(contextPrompt.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-colors"
          >
            Archive
          </button>
        </div>
      )}
    </div>
  );
}
