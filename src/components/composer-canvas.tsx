"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Layers, Trash2 } from "lucide-react";
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

// Extract {{variable}} tokens from text, deduped
function extractVariables(text: string): string[] {
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  const seen = new Set<string>();
  const vars: string[] = [];
  for (const match of matches) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      vars.push(match[1]);
    }
  }
  return vars;
}

function assemblePrompt(
  blocks: ComposerBlockType[],
  variables: Record<string, string>
): string {
  const parts = blocks.map((b) => {
    let text = b.body;
    for (const [key, val] of Object.entries(variables)) {
      if (val.trim()) {
        text = text.replaceAll(`{{${key}}}`, val);
      }
    }
    return text;
  });
  return parts.join("\n\n");
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

  // All variables from all blocks, deduped
  const variables = useMemo(() => {
    const allText = blocks.map((b) => b.body).join(" ");
    return extractVariables(allText);
  }, [blocks]);

  const handleVariableChange = useCallback((key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCopy = useCallback(async () => {
    const text = assemblePrompt(blocks, variableValues);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [blocks, variableValues]);

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
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
    <div className="flex flex-col h-full bg-[#0f1317]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05] shrink-0">
        <div className="flex items-center gap-2 text-white/40 text-sm">
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={blocks.length === 0}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              blocks.length === 0
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : copied
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center">
              <Layers size={22} className="text-white/20" />
            </div>
            <div>
              <p className="text-white/50 text-sm font-medium">Your composer is empty</p>
              <p className="text-white/25 text-xs mt-1">
                Open the library to add pieces, or press{" "}
                <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-white/40 text-[10px] font-mono">/</kbd>{" "}
                to search
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-2">
            {blocks.map((block, index) => (
              <div
                key={block.instanceId}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`transition-opacity ${
                  dragIndex === index ? "opacity-40" : ""
                } ${dropIndex === index && dragIndex !== index ? "ring-1 ring-indigo-500 ring-offset-1 ring-offset-[#0f1317] rounded-lg" : ""}`}
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

        {/* Variables section */}
        {!isEmpty && variables.length > 0 && (
          <div className="mx-4 mb-4 rounded-lg border border-white/[0.06] bg-[#1a2128] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.05]">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">
                Variables
              </span>
            </div>
            <div className="p-3 flex flex-col gap-2.5">
              {variables.map((varName) => (
                <div key={varName} className="flex items-center gap-3">
                  <label className="text-xs font-mono text-white/50 w-28 shrink-0 truncate">
                    {varName}
                  </label>
                  <input
                    type="text"
                    value={variableValues[varName] ?? ""}
                    onChange={(e) => handleVariableChange(varName, e.target.value)}
                    placeholder={`{{${varName}}}`}
                    className="flex-1 min-w-0 bg-[#0f1317] border border-white/[0.06] rounded-md px-3 py-1.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
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
