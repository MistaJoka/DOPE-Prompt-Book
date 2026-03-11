import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  OUTPUT_TYPES,
  PREFERRED_MODELS,
  PROMPT_CATEGORIES,
  PROMPT_STATUSES,
  PromptDefinition,
  PromptMutationInput,
  SNIP_SUBCATEGORIES
} from "@/types/prompt";

type PromptEditorProps = {
  open: boolean;
  prompt: PromptDefinition | null;
  onClose: () => void;
  onSave: (payload: PromptMutationInput) => Promise<void>;
};

type EditorForm = {
  title: string;
  summary: string;
  body: string;
  tags: string;
  collection: string;
  variables: string;
  outputType: PromptMutationInput["outputType"];
  preferredModel: PromptMutationInput["preferredModel"];
  favorite: boolean;
  status: PromptMutationInput["status"];
  category: PromptMutationInput["category"];
  subcategory: PromptMutationInput["subcategory"] | "";
};

function toForm(prompt: PromptDefinition | null): EditorForm {
  return {
    title: prompt?.title ?? "",
    summary: prompt?.summary ?? "",
    body: prompt?.body ?? "",
    tags: prompt?.tags.join(", ") ?? "",
    collection: prompt?.collection ?? "",
    variables: prompt?.variables.join(", ") ?? "",
    outputType: prompt?.outputType ?? "markdown",
    preferredModel: prompt?.preferredModel ?? "gpt-4.1",
    favorite: prompt?.favorite ?? false,
    status: prompt?.status ?? "active",
    category: prompt?.category ?? "recipe",
    subcategory: prompt?.subcategory ?? ""
  };
}

function toPayload(form: EditorForm): PromptMutationInput {
  return {
    title: form.title.trim(),
    summary: form.summary.trim(),
    body: form.body.trim(),
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    collection: form.collection.trim(),
    variables: form.variables
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    outputType: form.outputType,
    preferredModel: form.preferredModel,
    favorite: form.favorite,
    status: form.status,
    category: form.category,
    subcategory: form.category === "snip" ? form.subcategory || undefined : undefined
  };
}

export function PromptEditor({ open, prompt, onClose, onSave }: PromptEditorProps) {
  const [form, setForm] = useState<EditorForm>(toForm(prompt));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const title = useMemo(() => (prompt ? "Edit Prompt" : "New Prompt"), [prompt]);

  useEffect(() => {
    setForm(toForm(prompt));
    setError(null);
    setIsSaving(false);
  }, [prompt, open]);

  if (!open) {
    return null;
  }

  const payload = toPayload(form);
  const isDisabled =
    !payload.title ||
    !payload.summary ||
    !payload.body ||
    !payload.collection ||
    (payload.category === "snip" && !payload.subcategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 md:flex md:items-center md:justify-center md:p-3">
      <div className="flex h-[100dvh] w-full flex-col bg-[#11171c] md:max-h-[90vh] md:max-w-3xl md:overflow-hidden md:rounded-xl md:border md:border-border md:shadow-soft">
        <div className="safe-top flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-xs text-white/35">
              Prompts save into repo files under `prompts/`.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-muted-foreground">Title</label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((value) => ({ ...value, title: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-muted-foreground">Summary</label>
              <Input
                value={form.summary}
                onChange={(event) =>
                  setForm((value) => ({ ...value, summary: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-muted-foreground">Prompt Body</label>
              <textarea
                value={form.body}
                onChange={(event) =>
                  setForm((value) => ({ ...value, body: event.target.value }))
                }
                className="min-h-48 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tags (comma-separated)</label>
              <Input
                value={form.tags}
                onChange={(event) =>
                  setForm((value) => ({ ...value, tags: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Collection</label>
              <Input
                value={form.collection}
                onChange={(event) =>
                  setForm((value) => ({ ...value, collection: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Variables (comma-separated)</label>
              <Input
                value={form.variables}
                onChange={(event) =>
                  setForm((value) => ({ ...value, variables: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Output Type</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                value={form.outputType}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    outputType: event.target.value as PromptMutationInput["outputType"]
                  }))
                }
              >
                {OUTPUT_TYPES.map((outputType) => (
                  <option key={outputType} value={outputType}>
                    {outputType}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Preferred Model</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                value={form.preferredModel}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    preferredModel: event.target.value as PromptMutationInput["preferredModel"]
                  }))
                }
              >
                {PREFERRED_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                value={form.status}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    status: event.target.value as PromptMutationInput["status"]
                  }))
                }
              >
                {PROMPT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Category</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                value={form.category}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    category: event.target.value as PromptMutationInput["category"],
                    subcategory: ""
                  }))
                }
              >
                {PROMPT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {form.category === "snip" && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Snip Type</label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                  value={form.subcategory}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      subcategory: event.target.value as EditorForm["subcategory"]
                    }))
                  }
                >
                  <option value="">select a subcategory</option>
                  {SNIP_SUBCATEGORIES.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="mt-2 flex items-center gap-2 text-sm md:mt-5">
              <input
                type="checkbox"
                checked={form.favorite}
                onChange={(event) =>
                  setForm((value) => ({ ...value, favorite: event.target.checked }))
                }
              />
              Favorite
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="safe-bottom mt-auto flex shrink-0 justify-end gap-2 border-t border-white/[0.06] px-4 py-3">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setIsSaving(true);
              setError(null);

              try {
                await onSave(payload);
              } catch (saveError) {
                setError(
                  saveError instanceof Error ? saveError.message : "Failed to save prompt"
                );
                setIsSaving(false);
              }
            }}
            disabled={isDisabled || isSaving}
          >
            {isSaving ? "Saving..." : "Save Prompt"}
          </Button>
        </div>
      </div>
    </div>
  );
}
