# Prompt Library

`prompts/` is the canonical prompt library for the app.

## Layout

- `prompts/snips/`
- `prompts/recipes/`
- `prompts/kits/`

Each file is one prompt definition. The filename is the prompt slug. The file contents are YAML frontmatter plus the Markdown body.

## Frontmatter Fields

- `id`: stable prompt id used by the app and API routes
- `title`: display name and slug source
- `summary`: short library description
- `tags`: searchable/filterable tags
- `collection`: grouping label shown in the library
- `variables`: variable names referenced in the body, such as `product_name`
- `outputType`: one of `markdown`, `json`, `bullet-list`, `email`, `table`
- `preferredModel`: one of `gpt-4.1`, `gpt-4o`, `o4-mini`, `claude-sonnet`, `gemini-pro`
- `status`: one of `active`, `draft`, `archived`
- `category`: one of `snip`, `recipe`, `kit`
- `subcategory`: required for snips, one of `role`, `tone`, `output`, `rules`
- `favorite`: optional boolean
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp

## Write Path

Do not edit prompt files through ad hoc scripts in the app code.

- Reads and writes should go through `src/lib/prompt-repository.ts`
- UI mutations should go through `app/api/prompts/**`
- Browser storage is only for workspace state and usage metadata, not the prompt source of truth
