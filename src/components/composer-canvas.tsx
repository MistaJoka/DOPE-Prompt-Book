"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Layers, Trash2 } from "lucide-react";

import {
  assemblePrompt,
  extractVariablesFromBlocks
} from "@/lib/composer";
import { ComposerBlock as ComposerBlockType } from "@/types/prompt";
import { ComposerBlock } from "./composer-block";

interface ComposerCanvasProps {
  blocks: ComposerBlockType[];
  onToggleExpand: (instanceId: string) => void;
  onRemove: (instanceId: string) => void;
  onBodyChange: (instanceId: string, body: string) => void;
  onReorder: (from: number, to: number) => void;
  onClearAll: () => void;
}

function SortableComposerItem({
  block,
  index,
  onToggleExpand,
  onRemove,
  onBodyChange
}: {
  block: ComposerBlockType;
  index: number;
  onToggleExpand: (instanceId: string) => void;
  onRemove: (instanceId: string) => void;
  onBodyChange: (instanceId: string, body: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: block.instanceId
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      className={isDragging ? "z-10" : undefined}
    >
      <ComposerBlock
        block={block}
        index={index}
        onToggleExpand={onToggleExpand}
        onRemove={onRemove}
        onBodyChange={onBodyChange}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

export function ComposerCanvas({
  blocks,
  onToggleExpand,
  onRemove,
  onBodyChange,
  onReorder,
  onClearAll
}: ComposerCanvasProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const variables = useMemo(() => extractVariablesFromBlocks(blocks), [blocks]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleVariableChange = useCallback((key: string, value: string) => {
    setVariableValues((previous) => ({ ...previous, [key]: value }));
  }, []);

  const handleCopy = useCallback(async () => {
    const text = assemblePrompt(blocks, variableValues);

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [blocks, variableValues]);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) {
        return;
      }

      const fromIndex = blocks.findIndex((block) => block.instanceId === active.id);
      const toIndex = blocks.findIndex((block) => block.instanceId === over.id);

      if (fromIndex !== -1 && toIndex !== -1) {
        onReorder(fromIndex, toIndex);
      }
    },
    [blocks, onReorder]
  );

  const isEmpty = blocks.length === 0;

  return (
    <div className="flex h-full flex-col bg-[#0f1317]">
      <div className="flex shrink-0 flex-col gap-3 border-b border-white/[0.05] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Layers size={14} />
          <span>
            {blocks.length === 0
              ? "No pieces"
              : blocks.length === 1
              ? "1 piece"
              : `${blocks.length} pieces`}
          </span>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {blocks.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs text-white/30 transition-colors hover:bg-white/5 hover:text-white/60 sm:flex-none"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={blocks.length === 0}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all sm:flex-none ${
              blocks.length === 0
                ? "cursor-not-allowed bg-white/5 text-white/20"
                : copied
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
              <Layers size={22} className="text-white/20" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/50">Your composer is empty</p>
              <p className="mt-1 text-xs text-white/25">
                Open the library to add pieces. Desktop search is still available with{" "}
                <kbd className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[10px] text-white/40">
                  /
                </kbd>
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((block) => block.instanceId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2 p-3 sm:p-4">
                {blocks.map((block, index) => (
                  <SortableComposerItem
                    key={block.instanceId}
                    block={block}
                    index={index}
                    onToggleExpand={onToggleExpand}
                    onRemove={onRemove}
                    onBodyChange={onBodyChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {!isEmpty && variables.length > 0 && (
          <div className="mx-3 mb-3 overflow-hidden rounded-lg border border-white/[0.06] bg-[#1a2128] sm:mx-4 sm:mb-4">
            <div className="border-b border-white/[0.05] px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Variables
              </span>
            </div>
            <div className="flex flex-col gap-2.5 p-3">
              {variables.map((variableName) => (
                <div key={variableName} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <label className="w-full shrink-0 truncate font-mono text-xs text-white/50 sm:w-28">
                    {variableName}
                  </label>
                  <input
                    type="text"
                    value={variableValues[variableName] ?? ""}
                    onChange={(event) =>
                      handleVariableChange(variableName, event.target.value)
                    }
                    placeholder={`{{${variableName}}}`}
                    className="min-w-0 flex-1 rounded-md border border-white/[0.06] bg-[#0f1317] px-3 py-1.5 text-sm text-white/80 transition-colors placeholder:text-white/20 focus:border-white/20 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
