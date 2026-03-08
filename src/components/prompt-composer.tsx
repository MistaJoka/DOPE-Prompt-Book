"use client";

import { useRef } from "react";
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PromptItem } from "@/types/prompt";

type PromptComposerProps = {
  open: boolean;
  onToggle: () => void;
  ids: string[];
  prompts: PromptItem[];
  vars: Record<string, string>;
  onVarChange: (key: string, value: string) => void;
  onRemove: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onClear: () => void;
  onSaveAsNew: (body: string) => void;
};

function extractVars(bodies: string[]): string[] {
  const all = bodies.flatMap((body) =>
    [...body.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1].trim())
  );
  return [...new Set(all)];
}

function buildOutput(pieces: PromptItem[], vars: Record<string, string>): string {
  return pieces
    .map((p) =>
      Object.entries(vars).reduce(
        (b, [k, v]) => (v ? b.replaceAll(`{{${k}}}`, v) : b),
        p.body
      )
    )
    .join("\n\n---\n\n");
}

export function PromptComposer({
  open,
  onToggle,
  ids,
  prompts,
  vars,
  onVarChange,
  onRemove,
  onReorder,
  onClear,
  onSaveAsNew,
}: PromptComposerProps){
  const pieces = ids
    .map((id) => prompts.find((p) => p.id === id))
    .filter(Boolean) as PromptItem[];

  const allVars = extractVars(pieces.map((p) => p.body));
  const output = buildOutput(pieces, vars);
  const draggedId = useRef<string | null>(null);

  const handleDrop = (targetId: string): void => {
    if (!draggedId.current || draggedId.current === targetId) return;
    const from = ids.indexOf(draggedId.current);
    const to = ids.indexOf(targetId);
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, draggedId.current);
    onReorder(next);
    draggedId.current = null;
  };

  const copyOutput = async (): Promise<void> => {
    await navigator.clipboard.writeText(output);
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 overflow-hidden border-t border-border/70 bg-background transition-[height] duration-300 ease-in-out",
        open ? "h-72" : "h-9"
      )}
    >
      {/* Handle bar — always visible */}
      <div className="flex h-9 items-center gap-2 px-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold tracking-wide text-foreground">Composer</span>
          {ids.length > 0 && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
              {ids.length} {ids.length === 1 ? "piece" : "pieces"}
            </span>
          )}
        </button>

        {ids.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear all
          </button>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Content — below handle */}
      <div className="flex h-[252px] flex-col gap-2 px-4 pb-3">
        {/* Piece tray */}
        <div className="flex h-9 shrink-0 items-center gap-2 overflow-x-auto">
          {ids.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">
              Add prompts using the + button on any card.
            </p>
          ) : (
            pieces.map((piece) => (
              <div
                key={piece.id}
                draggable
                onDragStart={() => {
                  draggedId.current = piece.id;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(piece.id)}
                className="flex shrink-0 cursor-grab items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary active:cursor-grabbing"
              >
                <GripVertical className="h-3 w-3 text-primary/50" />
                <span className="max-w-[140px] truncate font-medium">{piece.title}</span>
                <button
                  type="button"
                  onClick={() => onRemove(piece.id)}
                  className="ml-0.5 text-primary/60 transition-colors hover:text-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {ids.length > 0 && (
          <div className="flex min-h-0 flex-1 gap-3">
            {/* Variables + output */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {allVars.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {allVars.map((v) => (
                    <div key={v} className="flex items-center gap-1.5">
                      <label className="font-mono text-[11px] text-primary/80">{`{{${v}}}`}</label>
                      <Input
                        value={vars[v] ?? ""}
                        onChange={(e) => onVarChange(v, e.target.value)}
                        placeholder={v}
                        className="h-6 w-28 px-2 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              <textarea
                readOnly
                value={output}
                className="min-h-0 w-full flex-1 resize-none rounded-md border border-border/60 bg-muted/20 px-3 py-2 font-mono text-xs text-foreground/80 focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 flex-col justify-end gap-2">
              <Button size="sm" variant="outline" onClick={copyOutput} className="gap-1.5">
                <Copy className="h-3 w-3" />
                Copy
              </Button>
              <Button size="sm" onClick={() => onSaveAsNew(output)} className="gap-1.5">
                <Plus className="h-3 w-3" />
                Save as new
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
