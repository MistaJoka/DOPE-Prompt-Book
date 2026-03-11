"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";

import { categoryLabel } from "@/lib/prompt-store";
import { PromptRecord } from "@/types/prompt";

function dateValue(value: string | null): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

interface CommandPaletteProps {
  open: boolean;
  prompts: PromptRecord[];
  onClose: () => void;
  onAddToComposer: (prompt: PromptRecord) => void;
  onNewPrompt: () => void;
  writeActionsEnabled: boolean;
  writeDisabledMessage: string;
}

export function CommandPalette({
  open,
  prompts,
  onClose,
  onAddToComposer,
  onNewPrompt,
  writeActionsEnabled,
  writeDisabledMessage
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
        .filter((prompt) => prompt.status !== "archived")
        .filter((prompt) =>
          [
            prompt.title,
            prompt.summary,
            prompt.tags.join(" "),
            prompt.collection,
            prompt.variables.join(" ")
          ]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .slice(0, 8)
    : prompts
        .filter((prompt) => prompt.status !== "archived")
        .sort(
          (left, right) =>
            dateValue(right.lastUsedAt) - dateValue(left.lastUsedAt) ||
            right.useCount - left.useCount
        )
        .slice(0, 8);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = filtered[activeIndex];

      if (target) {
        onAddToComposer(target);
        onClose();
      }
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 md:flex md:items-start md:justify-center md:pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="flex h-[100dvh] w-full flex-col bg-[#1a2128] md:h-auto md:max-w-lg md:overflow-hidden md:rounded-xl md:border md:border-white/[0.08] md:shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="safe-top flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
          <Search size={15} className="shrink-0 text-white/30" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search prompts to add…"
            className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded border border-white/[0.08] px-2 py-1 text-[11px] text-white/45 transition-colors hover:border-white/[0.14] hover:text-white/70 md:hidden"
          >
            Close
          </button>
          <kbd className="hidden rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-white/25 md:inline-flex">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-1 md:max-h-72 md:flex-none">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-white/30">No results</p>
          ) : (
            filtered.map((prompt, index) => (
              <button
                key={prompt.id}
                onClick={() => {
                  onAddToComposer(prompt);
                  onClose();
                }}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === activeIndex ? "bg-indigo-600/20" : "hover:bg-white/[0.04]"
                }`}
              >
                <span className="mt-0.5 shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                  {categoryLabel(prompt.category, prompt.subcategory)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white/85">{prompt.title}</p>
                  <p className="mt-0.5 truncate text-xs text-white/35">{prompt.summary}</p>
                </div>
                {index === activeIndex && (
                  <span className="mt-0.5 shrink-0 rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-white/30">
                    ↵ add
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="safe-bottom flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-2.5">
          <span className="hidden text-xs text-white/25 md:inline">
            ↑↓ navigate · ↵ add to composer
          </span>
          <span className="text-xs text-white/25 md:hidden">Tap a prompt to add it.</span>
          <button
            onClick={() => {
              onNewPrompt();
              onClose();
            }}
            disabled={!writeActionsEnabled}
            title={writeActionsEnabled ? "New prompt" : writeDisabledMessage}
            className={`flex items-center gap-1 text-xs transition-colors ${
              writeActionsEnabled
                ? "text-white/40 hover:text-white/70"
                : "cursor-not-allowed text-white/20"
            }`}
          >
            <Plus size={12} />
            New prompt
          </button>
        </div>
      </div>
    </div>
  );
}
