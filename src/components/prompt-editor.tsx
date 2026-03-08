import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PromptCategory, PromptItem, SnipSubcategory } from "@/types/prompt";

type PromptEditorProps = {
  open: boolean;
  prompt: PromptItem | null;
  initialBody?: string;
  onClose: () => void;
  onSave: (payload: Omit<PromptItem, "id" | "createdAt" | "updatedAt" | "lastUsedAt" | "useCount" | "versions">) => void;
};

type EditorForm = {
  title: string;
  summary: string;
  body: string;
  tags: string;
  collection: string;
  variables: string;
  outputType: PromptItem["outputType"];
  preferredModel: PromptItem["preferredModel"];
  favorite: boolean;
  status: PromptItem["status"];
  category: PromptCategory;
  subcategory: SnipSubcategory | "";
};

function toForm(prompt: PromptItem | null): EditorForm {
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

export function PromptEditor({ open, prompt, initialBody, onClose, onSave }: PromptEditorProps){
  const [form, setForm] = useState<EditorForm>(toForm(prompt));
  const title = useMemo(() => (prompt ? "Edit Prompt" : "New Prompt"), [prompt]);

  useEffect(() => {
    const base = toForm(prompt);
    setForm(initialBody && !prompt ? { ...base, body: initialBody } : base);
  }, [prompt, open, initialBody]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-[#11171c] p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-muted-foreground">Summary</label>
            <Input
              value={form.summary}
              onChange={(e) => setForm((v) => ({ ...v, summary: e.target.value }))}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-muted-foreground">Prompt Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((v) => ({ ...v, body: e.target.value }))}
              className="min-h-48 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Tags (comma-separated)</label>
            <Input value={form.tags} onChange={(e) => setForm((v) => ({ ...v, tags: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Collection</label>
            <Input
              value={form.collection}
              onChange={(e) => setForm((v) => ({ ...v, collection: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Variables (comma-separated)</label>
            <Input
              value={form.variables}
              onChange={(e) => setForm((v) => ({ ...v, variables: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Output Type</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              value={form.outputType}
              onChange={(e) =>
                setForm((v) => ({ ...v, outputType: e.target.value as PromptItem["outputType"] }))
              }
            >
              <option value="markdown">markdown</option>
              <option value="json">json</option>
              <option value="bullet-list">bullet-list</option>
              <option value="email">email</option>
              <option value="table">table</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Preferred Model</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              value={form.preferredModel}
              onChange={(e) =>
                setForm((v) => ({ ...v, preferredModel: e.target.value as PromptItem["preferredModel"] }))
              }
            >
              <option value="gpt-4.1">gpt-4.1</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="o4-mini">o4-mini</option>
              <option value="claude-sonnet">claude-sonnet</option>
              <option value="gemini-pro">gemini-pro</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              value={form.status}
              onChange={(e) => setForm((v) => ({ ...v, status: e.target.value as PromptItem["status"] }))}
            >
              <option value="active">active</option>
              <option value="draft">draft</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Category</label>
            <select
              className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              value={form.category}
              onChange={(e) => setForm((v) => ({ ...v, category: e.target.value as PromptCategory, subcategory: "" }))}
            >
              <option value="recipe">recipe</option>
              <option value="snip">snip</option>
              <option value="kit">kit</option>
            </select>
          </div>
          {form.category === "snip" && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Snip Type</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                value={form.subcategory}
                onChange={(e) => setForm((v) => ({ ...v, subcategory: e.target.value as SnipSubcategory }))}
              >
                <option value="">— select —</option>
                <option value="role">role</option>
                <option value="tone">tone</option>
                <option value="output">output</option>
                <option value="rules">rules</option>
              </select>
            </div>
          )}
          <label className="mt-5 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(e) => setForm((v) => ({ ...v, favorite: e.target.checked }))}
            />
            Favorite
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                title: form.title.trim(),
                summary: form.summary.trim(),
                body: form.body,
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
                subcategory: form.subcategory || undefined
              })
            }
            disabled={!form.title.trim() || !form.body.trim()}
          >
            Save Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}
