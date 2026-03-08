# Contributing to DOPE-Prompt-Book

Thanks for contributing! Every module you add makes the library more powerful for everyone.

## Module Quality Standard

Every module file must follow this exact template:

---

# [Module Name]

**Type:** role | task | format | tone | constraint | context
**Tags:** #tag1 #tag2
**Works With:** [list compatible module types]
**Tested On:** claude | gpt-4 | gemini | all

## Prompt Text

[The reusable prompt snippet goes here]

## Usage Notes

- When TO use this module
- When NOT to use this module

## Example Combo

[Show this module assembled with 1-2 others into a full prompt]

---

## Rules for Good Modules

1. **One job.** Each module does exactly one thing. If it's doing two things, split it.
2. **Composable.** It should snap cleanly onto other modules without conflicting.
3. **Tested.** Run your module on at least one LLM before submitting.
4. **No redundancy.** Check `index.md` before creating — a similar module may already exist.

## Module Types

| Type | Purpose | Example |
|------|---------|---------|
| `role` | Defines who the AI is | "You are a senior analyst..." |
| `task` | Defines what to do | "Summarize the provided content..." |
| `format` | Defines how to structure output | "Use bullet points with bold headers..." |
| `tone` | Defines voice/style | "Be direct. Skip preamble..." |
| `constraint` | Adds limits or guardrails | "Keep response under [N] words..." |
| `context` | Provides audience/situation info | "The reader has no prior knowledge..." |

## File Naming

- Use lowercase with hyphens: `expert-analyst.md`
- Place in the correct subfolder: `modules/role/expert-analyst.md`
- Keep names descriptive and unique

## Submitting a Combo

If you've assembled a great prompt from multiple modules, add it to `combiners/examples/`.

Name the file descriptively: `combiners/examples/beginner-lesson-summary.md`

## Pull Request Checklist

Before opening a PR, confirm:

- [ ] Module file is in the correct `modules/[type]/` folder
- [ ] Filename uses lowercase-hyphen format
- [ ] All frontmatter fields are filled in (Type, Tags, Works With, Tested On)
- [ ] Prompt Text section contains the actual prompt snippet
- [ ] Usage Notes explain when to use and when NOT to use
- [ ] Example Combo shows the module assembled with at least one other module
- [ ] `index.md` has been updated with the new module entry
