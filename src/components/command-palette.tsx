import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PromptItem } from "@/types/prompt";

type CommandPaletteProps = {
  open: boolean;
  prompts: PromptItem[];
  selectedPrompt: PromptItem | null;
  onClose: () => void;
  onJumpToPrompt: (promptId: string) => void;
  onCreatePrompt: () => void;
  onDuplicateSelected: () => void;
  onToggleFavoriteSelected: () => void;
};

export function CommandPalette({
  open,
  prompts,
  selectedPrompt,
  onClose,
  onJumpToPrompt,
  onCreatePrompt,
  onDuplicateSelected,
  onToggleFavoriteSelected
}: CommandPaletteProps){
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const visiblePrompts = useMemo(() => {
    const lower = query.toLowerCase().trim();
    return prompts
      .filter((prompt) =>
        lower ? `${prompt.title} ${prompt.summary}`.toLowerCase().includes(lower) : true
      )
      .slice(0, 8);
  }, [prompts, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[10vh]">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-[#11171c] shadow-soft">
        <div className="border-b border-border/70 p-3">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to prompt, run action..."
          />
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-2">
          <p className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">Actions</p>
          <button
            type="button"
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
            onClick={() => {
              onCreatePrompt();
              onClose();
            }}
          >
            Create Prompt
          </button>
          <button
            type="button"
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
            onClick={() => {
              onDuplicateSelected();
              onClose();
            }}
            disabled={!selectedPrompt}
          >
            Duplicate Selected Prompt
          </button>
          <button
            type="button"
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
            onClick={() => {
              onToggleFavoriteSelected();
              onClose();
            }}
            disabled={!selectedPrompt}
          >
            Toggle Favorite on Selected
          </button>

          <p className="mt-3 px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">Jump to Prompt</p>
          {visiblePrompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              className="w-full rounded-md px-3 py-2 text-left hover:bg-accent"
              onClick={() => {
                onJumpToPrompt(prompt.id);
                onClose();
              }}
            >
              <p className="text-sm font-medium">{prompt.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{prompt.summary}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end border-t border-border/70 p-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
