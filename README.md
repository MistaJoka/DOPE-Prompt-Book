# DOPE Prompt Book

Local-first prompt library and composer built with Next.js, TypeScript, and Tailwind CSS.

## Current State

This repo is now a working local MVP:

- Prompt definitions live as Markdown files under [`prompts/`](./prompts)
- The app loads and mutates that library through Next.js API routes
- Workspace UI state and prompt usage stay local in the browser
- The main loop is browse -> filter -> compose -> fill variables -> copy

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Local file-backed prompt repository
- Local browser persistence for workspace state
- Node test runner + TypeScript compilation for tests

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Shipped Features

- Split-pane prompt library and composer
- Repo-backed prompt CRUD (`GET/POST/PUT` plus duplicate/archive actions)
- Faceted filters for tags, collection, status, model, and output type
- Sort modes for recently edited, recently used, most used, and alphabetical
- Explicit prompt row actions: add, edit, duplicate, favorite, archive
- Variable extraction and prompt assembly in the composer
- Command palette (`Cmd/Ctrl + K`)
- Local persistence for drawer state, filters, sort, composer blocks, and usage stats

## Local-First Architecture

- `prompts/` is the canonical prompt library
- `app/api/prompts/**` is the only write path for prompt files
- `src/lib/prompt-repository.ts` handles file IO, slug generation, and duplicate validation
- `src/lib/prompt-store.ts` handles client-side library filtering/sorting and workspace persistence
- `src/lib/composer.ts` contains pure composition helpers used by the UI and tests

## Prompt File Schema

Each prompt is one Markdown file with YAML frontmatter plus the prompt body:

```md
---
id: "recipe-1234abcd"
title: "Launch Brief"
summary: "Turn notes into a launch brief."
tags:
  - "launch"
  - "marketing"
collection: "Go-To-Market"
variables:
  - "product_name"
outputType: "markdown"
preferredModel: "gpt-4.1"
status: "active"
category: "recipe"
favorite: true
createdAt: "2026-03-09T10:00:00.000Z"
updatedAt: "2026-03-09T10:00:00.000Z"
---

Write a launch brief for {{product_name}}.
```

Required frontmatter:

- `id`
- `title`
- `summary`
- `tags`
- `collection`
- `variables`
- `outputType`
- `preferredModel`
- `status`
- `category`
- `createdAt`
- `updatedAt`

Optional frontmatter:

- `subcategory` for snips
- `favorite`

More detail is documented in [`prompts/README.md`](./prompts/README.md).
