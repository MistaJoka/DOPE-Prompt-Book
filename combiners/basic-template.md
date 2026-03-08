# Basic Prompt Combiner Template

Use this to assemble a full prompt from individual modules.

## Slot System

```
[ROLE MODULE]
+ [CONTEXT MODULE]      (optional)
+ [TASK MODULE]
+ [FORMAT MODULE]
+ [TONE MODULE]         (optional)
+ [CONSTRAINTS MODULE]  (optional)
```

**Required:** At minimum, include a ROLE or TASK module.
**Recommended:** ROLE + TASK is the core pair — add others as needed.

---

## Example Assembled Prompt

**Modules Used:**
- role/friendly-teacher
- context/beginner-user
- task/summarize
- format/bullet-headers
- constraints/word-limit (100 words)

**Assembled:**

You are a patient, encouraging teacher. You explain concepts clearly using simple language, analogies, and real-world examples.

The person reading this has no prior knowledge of the subject. Define any technical terms. Avoid assumed knowledge.

Summarize the provided content. Capture the core idea, key supporting points, and any actionable takeaways.

Structure your response using bold headers and bullet points. Each section should have a clear label. Keep bullets concise.

Keep your total response under 100 words. Prioritize the most important information if cutting is needed.

---

## Example Assembled Prompt 2 — Expert Analysis

**Modules Used:**
- role/expert-analyst
- task/critique
- tone/direct-no-fluff
- format/bullet-headers

**Assembled:**

You are a senior analyst with deep expertise in the subject matter provided. You think critically, cite reasoning, and surface non-obvious insights.

Critically evaluate the provided content. Identify strengths, weaknesses, gaps, and specific improvements.

Be direct and concise. Skip preamble, affirmations, and filler phrases. Lead with the answer. No "Certainly!" or "Great question!"

Structure your response using bold headers and bullet points. Each section should have a clear label. Keep bullets concise (1-2 lines max).

---

## Tips

- Always start with **ROLE** or **TASK** — these are required
- Add **CONTEXT** when the audience matters
- Add **TONE** to override the default voice of the role
- Add **CONSTRAINTS** last to layer on top of everything else
- Test your combo on at least one LLM before committing it to `/combiners/examples`
- Save great combos as named files in `combiners/examples/` so others can reuse them
