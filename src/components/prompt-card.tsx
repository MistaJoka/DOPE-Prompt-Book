import { Check, Plus, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeDate } from "@/lib/utils";
import { PromptItem } from "@/types/prompt";

type PromptCardProps = {
  prompt: PromptItem;
  selected: boolean;
  onSelect: () => void;
  composerIds: string[];
  onAddToComposer: (id: string) => void;
};

export function PromptCard({ prompt, selected, onSelect, composerIds, onAddToComposer }: PromptCardProps){
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
        "relative h-full cursor-pointer rounded-xl border border-border/70 bg-card p-4 text-left shadow-inset transition hover:border-border hover:bg-card/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary/60 ring-1 ring-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{prompt.title}</h3>
        <Star className={cn("h-4 w-4 shrink-0", prompt.favorite ? "fill-yellow-300 text-yellow-300" : "text-muted-foreground")} />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{prompt.summary}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {prompt.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="muted" className="text-[10px]">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{prompt.collection}</span>
        <div className="flex items-center gap-2">
          <span>{formatRelativeDate(prompt.updatedAt)}</span>
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
    </div>
  );
}
