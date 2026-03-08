import { Archive, Copy, Edit3, Heart, SquareStack } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { PromptItem } from "@/types/prompt";

type PromptDetailPaneProps = {
  prompt: PromptItem | null;
  onCopy: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onArchive: () => void;
  onEdit: () => void;
  copyFeedback: string;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

export function PromptDetailPane({
  prompt,
  onCopy,
  onDuplicate,
  onToggleFavorite,
  onArchive,
  onEdit,
  copyFeedback,
  mobile = false,
  onCloseMobile
}: PromptDetailPaneProps){
  if (!prompt) {
    return (
      <aside className="flex h-full items-center justify-center border-l border-border/70 bg-[#0f1317] px-5 text-sm text-muted-foreground">
        Select a prompt to view details.
      </aside>
    );
  }

  return (
    <aside className="h-full overflow-y-auto border-l border-border/70 bg-[#0f1317]">
      <div className="sticky top-0 z-10 border-b border-border/70 bg-[#0f1317]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{prompt.title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{prompt.summary}</p>
          </div>
          {mobile && onCloseMobile ? (
            <Button variant="ghost" size="sm" onClick={onCloseMobile}>
              Close
            </Button>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onCopy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Copy
          </Button>
          <Button size="sm" variant="outline" onClick={onDuplicate}>
            <SquareStack className="mr-1.5 h-3.5 w-3.5" />
            Duplicate
          </Button>
          <Button size="sm" variant="outline" onClick={onToggleFavorite}>
            <Heart className="mr-1.5 h-3.5 w-3.5" />
            {prompt.favorite ? "Unfavorite" : "Favorite"}
          </Button>
          <Button size="sm" variant="outline" onClick={onArchive}>
            <Archive className="mr-1.5 h-3.5 w-3.5" />
            Archive
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </div>

        {copyFeedback ? <p className="mt-2 text-xs text-emerald-300">{copyFeedback}</p> : null}
      </div>

      <div className="space-y-4 px-4 py-4">
        <section className="rounded-lg border border-border/70 bg-card p-4">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Prompt Body</h3>
          <pre className="whitespace-pre-wrap break-words text-[13px] leading-6 text-foreground">{prompt.body}</pre>
        </section>

        <section className="grid grid-cols-1 gap-3 rounded-lg border border-border/70 bg-card p-4 text-xs sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Collection</p>
            <p className="mt-1 font-medium">{prompt.collection}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge variant="outline" className="mt-1 capitalize">
              {prompt.status}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Output Type</p>
            <p className="mt-1 font-medium">{prompt.outputType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Preferred Model</p>
            <p className="mt-1 font-medium">{prompt.preferredModel}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Use Count</p>
            <p className="mt-1 font-medium">{prompt.useCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Used</p>
            <p className="mt-1 font-medium">{formatDate(prompt.lastUsedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="mt-1 font-medium">{formatDate(prompt.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Updated</p>
            <p className="mt-1 font-medium">{formatDate(prompt.updatedAt)}</p>
          </div>
        </section>

        <section className="rounded-lg border border-border/70 bg-card p-4">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border/70 bg-card p-4">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Variables</h3>
          <div className="flex flex-wrap gap-1.5">
            {prompt.variables.length ? (
              prompt.variables.map((variable) => (
                <Badge key={variable} variant="outline">
                  {`{{${variable}}}`}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No placeholders defined.</p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border/70 bg-card p-4">
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Version Preview</h3>
          <div className="space-y-2">
            {prompt.versions.slice(0, 4).map((version) => (
              <div key={version.id} className="rounded-md border border-border/60 p-2">
                <p className="text-xs font-medium">{version.note}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(version.updatedAt)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
