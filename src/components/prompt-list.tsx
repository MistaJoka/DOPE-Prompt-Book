import { PromptCard } from "@/components/prompt-card";
import { PromptRow } from "@/components/prompt-row";
import { PromptItem, ViewMode } from "@/types/prompt";

type PromptListProps = {
  prompts: PromptItem[];
  selectedPromptId: string | null;
  view: ViewMode;
  onSelectPrompt: (promptId: string) => void;
  composerIds: string[];
  onAddToComposer: (id: string) => void;
};

export function PromptList({
  prompts,
  selectedPromptId,
  view,
  onSelectPrompt,
  composerIds,
  onAddToComposer
}: PromptListProps){
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            selected={selectedPromptId === prompt.id}
            onSelect={() => onSelectPrompt(prompt.id)}
            composerIds={composerIds}
            onAddToComposer={onAddToComposer}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {prompts.map((prompt) => (
        <PromptRow
          key={prompt.id}
          prompt={prompt}
          selected={selectedPromptId === prompt.id}
          view={view}
          onSelect={() => onSelectPrompt(prompt.id)}
          composerIds={composerIds}
          onAddToComposer={onAddToComposer}
        />
      ))}
    </div>
  );
}
