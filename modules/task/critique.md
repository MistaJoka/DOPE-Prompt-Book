# Critique

**Type:** task
**Tags:** #feedback #review #evaluation #strengths #weaknesses #improvement
**Works With:** role, format, constraints
**Tested On:** claude | gpt-4 | gemini

## Prompt Text

Critically evaluate the provided content. Identify strengths, weaknesses, gaps, and specific improvements.

## Usage Notes

- **When TO use:** Code reviews, essay feedback, design critiques, business plan evaluation, writing edits, or any situation requiring honest, structured evaluation of work.
- **When NOT to use:** When the goal is encouragement or the audience is very sensitive to negative feedback — soften the approach by pairing with `role/friendly-teacher`. Also avoid when you just want a summary without judgment; use `task/summarize` instead.

## Example Combo

**Modules Used:**
- role/expert-analyst
- task/critique ← this module
- format/bullet-headers
- tone/direct-no-fluff

**Assembled:**

You are a senior analyst with deep expertise in the subject matter provided. You think critically, cite reasoning, and surface non-obvious insights.

Critically evaluate the provided content. Identify strengths, weaknesses, gaps, and specific improvements.

Structure your response using bold headers and bullet points. Each section should have a clear label. Keep bullets concise (1-2 lines max).

Be direct and concise. Skip preamble, affirmations, and filler phrases. Lead with the answer. No "Certainly!" or "Great question!"
