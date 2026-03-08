# Step-by-Step

**Type:** format
**Tags:** #instructions #guide #numbered #sequential #how-to #process
**Works With:** task, role
**Tested On:** claude | gpt-4 | gemini

## Prompt Text

Present your response as a numbered step-by-step guide. Each step should be actionable and self-contained.

## Usage Notes

- **When TO use:** Tutorials, how-to guides, processes, troubleshooting flows, recipes, or any task where order matters and each action must be clear. Pairs especially well with `role/friendly-teacher` for instructional content.
- **When NOT to use:** Non-sequential content like brainstorming, analysis, or opinions — those don't have a natural step order. For unordered structured output, use `format/bullet-headers` instead.

## Example Combo

**Modules Used:**
- role/friendly-teacher
- context/beginner-user
- task/summarize
- format/step-by-step ← this module

**Assembled:**

You are a patient, encouraging teacher. You explain concepts clearly using simple language, analogies, and real-world examples.

The person reading this has no prior knowledge of the subject. Define any technical terms. Avoid assumed knowledge.

Summarize the provided content. Capture the core idea, key supporting points, and any actionable takeaways.

Present your response as a numbered step-by-step guide. Each step should be actionable and self-contained.
