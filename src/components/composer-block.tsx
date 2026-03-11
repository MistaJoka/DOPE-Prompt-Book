"use client";

import { ChevronDown, ChevronRight, GripVertical, X } from "lucide-react";
import { ComposerBlock as ComposerBlockType } from "@/types/prompt";
import { categoryLabel } from "@/lib/prompt-store";

const CATEGORY_COLORS: Record<string, string> = {
  Role: "bg-violet-900/60 text-violet-300 border-violet-700/50",
  Tone: "bg-sky-900/60 text-sky-300 border-sky-700/50",
  Output: "bg-emerald-900/60 text-emerald-300 border-emerald-700/50",
  Rules: "bg-amber-900/60 text-amber-300 border-amber-700/50",
  Recipe: "bg-rose-900/60 text-rose-300 border-rose-700/50",
  Kit: "bg-orange-900/60 text-orange-300 border-orange-700/50",
  Snip: "bg-slate-700/60 text-slate-300 border-slate-600/50"
};

interface ComposerBlockProps {
  block: ComposerBlockType;
  index: number;
  onToggleExpand: (instanceId: string) => void;
  onRemove: (instanceId: string) => void;
  onBodyChange: (instanceId: string, body: string) => void;
  dragHandleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}

export function ComposerBlock({
  block,
  onToggleExpand,
  onRemove,
  onBodyChange,
  dragHandleProps,
  isDragging = false
}: ComposerBlockProps) {
  const label = categoryLabel(block.category, block.subcategory);
  const badgeColor = CATEGORY_COLORS[label] ?? CATEGORY_COLORS["Snip"];

  return (
    <div
      className={`group flex items-stretch gap-0 rounded-lg border bg-[#1a2128] transition-colors ${
        isDragging
          ? "border-indigo-400/45 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]"
          : "border-white/[0.06] hover:border-white/10"
      }`}
    >
      <button
        type="button"
        {...dragHandleProps}
        className="flex items-center rounded-l-lg px-2 text-white/20 transition-colors hover:text-white/55 focus:outline-none focus-visible:text-white/70 touch-none cursor-grab active:cursor-grabbing"
        aria-label={`Reorder ${block.title}`}
      >
        <GripVertical size={14} />
      </button>

      <div className="min-w-0 flex-1 py-2.5 pr-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeColor}`}
            >
              {label}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/85">
              {block.title}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => onToggleExpand(block.instanceId)}
              className="p-1 rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
              title={block.isExpanded ? "Collapse" : "Expand"}
            >
              {block.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <button
              onClick={() => onRemove(block.instanceId)}
              className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Remove block"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {block.isExpanded && (
          <textarea
            value={block.body}
            onChange={(e) => onBodyChange(block.instanceId, e.target.value)}
            className="mt-2.5 w-full bg-[#0f1317] border border-white/[0.06] rounded-md px-3 py-2 text-sm text-white/80 font-mono resize-none focus:outline-none focus:border-white/20 focus:ring-0 placeholder:text-white/20"
            rows={Math.min(Math.max(block.body.split("\n").length, 3), 12)}
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
