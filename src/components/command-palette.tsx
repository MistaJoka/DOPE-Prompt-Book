"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PromptItem } from "@/types/prompt";
import { categoryLabel } from "@/lib/prompt-store";

interface CommandPaletteProps {
  open: boolean;
  prompts: PromptItem[];
  onClose: () => void;
  onAddToComposer: (prompt: PromptItem) => void;
  onNewPrompt: () => void;
}

export function CommandPalette({
  open,
  prompts,
  onClose,
  onAddToComposer,
  onNewPrompt
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = query.trim()
    ? prompts
        .filter((p) => p.status !== "archived")
        .filter((p) =>
          [p.title, p.summary, p.tags.join(" "), p.collection]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .slice(0, 8)
    : prompts
        .filter((p) => p.status !== "archived")
        .sort((a, b) => +new Date(b.lastUsedAt) - +new Date(a.lastUsedAt))
        .slice(0, 8);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) {
        onAddToComposer(target);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#1a2128] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
          <Search size={15} className="text-white/30 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search prompts to add…"
            className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
          />
          <kbd className="text-[10px] text-white/25 bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-white/30 text-center">No results</p>
          ) : (
            filtered.map((prompt, index) => (
              <button
                key={prompt.id}
                onClick={() => {
                  onAddToComposer(prompt);
                  onClose();
                }}
                className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors ${
                  index === activeIndex ? "bg-indigo-600/20" : "hover:bg-white/[0.04]"
                }`}
              >
                <span className="shrink-0 mt-0.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40">
                  {categoryLabel(prompt.category, prompt.subcategory)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85 truncate">{prompt.title}</p>
                  <p className="text-xs text-white/35 truncate mt-0.5">{prompt.summary}</p>
                </div>
                {index === activeIndex && (
                  <span className="shrink-0 text-[10px] text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded font-mono mt-0.5">
                    ↵ add
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-white/25">↑↓ navigate · ↵ add to composer</span>
          <button
            onClick={() => {
              onNewPrompt();
              onClose();
            }}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <Plus size={12} />
            New prompt
          </button>
        </div>
      </div>
    </div>
  );
}
