# Prompt Workspace

Modern local-first personal prompt management app built with Next.js, TypeScript, Tailwind CSS, shadcn-style components, and Lucide icons.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn-compatible UI primitives (`Button`, `Input`, `Badge`)
- Lucide icons
- Local storage persistence with seeded mock JSON data

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Core Features

- Search-first split-pane workspace
- Sidebar scopes + smart views
- Faceted multi-select filters (tags, collection, status, model, output type)
- Sort modes (edited, used, most used, alphabetical)
- View modes (grid, list, compact)
- Command palette (`Cmd/Ctrl + K`)
- Prompt detail actions (copy, duplicate, favorite, archive, edit)
- Create/edit prompt modal
- Mobile filter sheet + full-screen detail view
- Local persistence of prompts + UI state

## Structure

- `app/` - Next app entry and global styles
- `src/types/` - reusable prompt types
- `src/data/` - realistic seed prompt data
- `src/lib/` - storage/filter/sort logic
- `src/components/` - workspace components
- `src/components/ui/` - reusable UI primitives
