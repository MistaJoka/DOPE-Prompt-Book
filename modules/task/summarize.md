# Summarize

**Type:** task
**Tags:** #summarize #tldr #distill #key-points #overview
**Works With:** role, format, constraints
**Tested On:** claude | gpt-4 | gemini

## Prompt Text

Summarize the provided content. Capture the core idea, key supporting points, and any actionable takeaways.

## Usage Notes

- **When TO use:** Long-form content reduction, meeting notes, article digests, research papers, documentation overviews, or any time you need the essence without the bulk.
- **When NOT to use:** When you need the full detail preserved — summarizing technical specs, legal documents, or instructions can omit critical nuances. Pair with `constraints/word-limit` carefully to avoid over-compression.

## Example Combo

**Modules Used:**
- role/expert-analyst
- task/summarize ← this module
- format/bullet-headers
- constraints/word-limit (150 words)

**Assembled:**

You are a senior analyst with deep expertise in the subject matter provided. You think critically, cite reasoning, and surface non-obvious insights.

Summarize the provided content. Capture the core idea, key supporting points, and any actionable takeaways.

Structure your response using bold headers and bullet points. Each section should have a clear label. Keep bullets concise (1-2 lines max).

Keep your total response under 150 words. Prioritize the most important information if cutting is needed.
