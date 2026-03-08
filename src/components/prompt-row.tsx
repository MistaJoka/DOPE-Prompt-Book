import { Check, Plus, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeDate } from "@/lib/utils";
import { PromptItem, ViewMode } from "@/types/prompt";

type PromptRowProps = {
  prompt: PromptItem;
  selected: boolean;
  view: ViewMode;
  onSelect: () => void;
  composerIds: string[];
  onAddToComposer: (id: string) => void;
};

export function PromptRow({ prompt, selected, view, onSelect, composerIds, onAddToComposer }: PromptRowProps){
  const inComposer = composerIds.includes(prompt.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={cn(
        "w-full cursor-pointer rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-border/70 hover:bg-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary/50 bg-accent"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{prompt.title}</p>
            <Badge
              variant="outline"
              className={cn(
                "capitalize",
                prompt.status === "draft" && "border-amber-400/50 text-amber-300",
                prompt.status === "archived" && "border-slate-500/50 text-slate-400"
              )}
            >
              {prompt.status}
            </Badge>
          </div>
          {view !== "compact" ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{prompt.summary}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Star className={cn("mt-0.5 h-4 w-4", prompt.favorite ? "fill-yellow-300 text-yellow-300" : "text-muted-foreground")} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToComposer(prompt.id);
            }}
            title={inComposer ? "In composer" : "Add to composer"}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded transition-colors",
              inComposer
                ? "text-emerald-400 hover:text-emerald-300"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {inComposer ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          {prompt.tags.slice(0, view === "compact" ? 1 : 3).map((tag) => (
            <Badge key={tag} variant="muted" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span>{prompt.useCount} uses</span>
          <span>{formatRelativeDate(prompt.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
