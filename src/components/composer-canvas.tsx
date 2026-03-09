"use client";

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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const variables = useMemo(() => extractVariablesFromBlocks(blocks), [blocks]);

  const handleVariableChange = useCallback((key: string, value: string) => {
    setVariableValues((previous) => ({ ...previous, [key]: value }));
  }, []);

  const handleCopy = useCallback(async () => {
    const text = assemblePrompt(blocks, variableValues);

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [blocks, variableValues]);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    setDropIndex(index);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex !== null && dragIndex !== targetIndex) {
      onReorder(dragIndex, targetIndex);
    }

    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const isEmpty = blocks.length === 0;

  return (
    <div className="flex h-full flex-col bg-[#0f1317]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.05] px-5 py-3.5">
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

        <div className="flex items-center gap-2">
          {blocks.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={blocks.length === 0}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
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
                Open the library to add pieces, or press{" "}
                <kbd className="rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[10px] text-white/40">
                  /
                </kbd>{" "}
                to search
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {blocks.map((block, index) => (
              <div
                key={block.instanceId}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(event) => handleDragOver(event, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`transition-opacity ${
                  dragIndex === index ? "opacity-40" : ""
                } ${
                  dropIndex === index && dragIndex !== index
                    ? "rounded-lg ring-1 ring-indigo-500 ring-offset-1 ring-offset-[#0f1317]"
                    : ""
                }`}
              >
                <ComposerBlock
                  block={block}
                  index={index}
                  onToggleExpand={onToggleExpand}
                  onRemove={onRemove}
                  onBodyChange={onBodyChange}
                />
              </div>
            ))}
          </div>
        )}

        {!isEmpty && variables.length > 0 && (
          <div className="mx-4 mb-4 overflow-hidden rounded-lg border border-white/[0.06] bg-[#1a2128]">
            <div className="border-b border-white/[0.05] px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Variables
              </span>
            </div>
            <div className="flex flex-col gap-2.5 p-3">
              {variables.map((variableName) => (
                <div key={variableName} className="flex items-center gap-3">
                  <label className="w-28 shrink-0 truncate font-mono text-xs text-white/50">
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
