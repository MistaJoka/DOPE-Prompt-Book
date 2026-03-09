import { ComposerBlock } from "../types/prompt";

export function extractVariables(text: string): string[] {
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  const seen = new Set<string>();
  const variables: string[] = [];

  for (const match of matches) {
    const variable = match[1];

    if (!seen.has(variable)) {
      seen.add(variable);
      variables.push(variable);
    }
  }

  return variables;
}

export function extractVariablesFromBlocks(blocks: ComposerBlock[]): string[] {
  return extractVariables(blocks.map((block) => block.body).join(" "));
}

export function assemblePrompt(
  blocks: ComposerBlock[],
  variables: Record<string, string>
): string {
  return blocks
    .map((block) => {
      let text = block.body;

      for (const [key, value] of Object.entries(variables)) {
        if (value.trim()) {
          text = text.replaceAll(`{{${key}}}`, value);
        }
      }

      return text;
    })
    .join("\n\n");
}

export function reorderComposerBlocks(
  blocks: ComposerBlock[],
  fromIndex: number,
  toIndex: number
): ComposerBlock[] {
  const nextBlocks = [...blocks];
  const [moved] = nextBlocks.splice(fromIndex, 1);

  if (!moved) {
    return blocks;
  }

  nextBlocks.splice(toIndex, 0, moved);
  return nextBlocks;
}
