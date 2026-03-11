# GEMINI.md - DOPE Prompt Book

## Project Overview
**DOPE Prompt Book** is a local-first prompt library and composer built with Next.js, TypeScript, and Tailwind CSS. It allows users to manage a collection of AI prompts (snips, recipes, kits), compose them into larger structures, fill variables, and copy the final output.

- **Primary Technologies:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, dnd-kit.
- **Architecture:** Local file-backed repository. Prompts are stored as Markdown files with YAML frontmatter in the `prompts/` directory.
- **Key Concepts:**
    - **Snips:** Reusable prompt fragments (role, tone, output, rules).
    - **Recipes:** Complete, standalone prompt templates.
    - **Kits:** Pre-packaged sets of prompts.
    - **Variables:** Identified by `{{variable_name}}` syntax.

## Building and Running
- **Install Dependencies:** `npm install`
- **Development Server:** `npm run dev` (starts on `http://localhost:3000`)
- **Build Production:** `npm run build`
- **Type Check:** `npm run typecheck`
- **Lint:** `npm run lint`
- **Testing:** `npm run test` (Note: This compiles TS to `.test-dist/` and runs them with `node --test`)

## Development Conventions

### Prompt File Schema
All prompts MUST be stored in the `prompts/` directory (categorized into `snips/`, `recipes/`, or `kits/`) as `.md` files. They require specific YAML frontmatter:

```yaml
---
id: "unique-id"
title: "Display Title"
summary: "Short description"
tags: ["tag1", "tag2"]
collection: "Collection Name"
variables: ["var1", "var2"]
outputType: "markdown" | "json" | "bullet-list" | "email" | "table"
preferredModel: "gpt-4.1" | "gpt-4o" | "o4-mini" | "claude-sonnet" | "gemini-pro"
status: "active" | "draft" | "archived"
category: "snip" | "recipe" | "kit"
subcategory: "role" | "tone" | "output" | "rules" (required for snips)
favorite: boolean (optional)
createdAt: "ISO-Timestamp"
updatedAt: "ISO-Timestamp"
---
Prompt body with {{var1}} and {{var2}}.
```

### Core Logic & Repositories
- **File IO:** Use `src/lib/prompt-repository.ts` for all prompt file operations. Do NOT perform ad-hoc file writes.
- **Composition:** Use `src/lib/composer.ts` for variable extraction and prompt assembly logic.
- **API Routes:** Use `app/api/prompts/` for CRUD operations that the UI interacts with.
- **Types:** Refer to `src/types/prompt.ts` for all prompt-related TypeScript interfaces.

### Testing Strategy
- Tests are located in the `tests/` directory.
- The project uses a custom test script: `tsc -p tsconfig.test.json && node --test .test-dist/tests/**/*.test.js`.
- Always verify changes by running `npm run test`.

### UI & Styling
- **Styling:** Use Tailwind CSS exclusively.
- **Icons:** Use `lucide-react`.
- **Drag & Drop:** Use `@dnd-kit` for composer block reordering.
- **State:** Local workspace state (drawer state, filters, composer blocks) is persisted in the browser's local storage via `src/lib/prompt-store.ts`.
