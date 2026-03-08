# Word Limit

**Type:** constraint
**Tags:** #brevity #limits #word-count #concise #length-control
**Works With:** all
**Tested On:** claude | gpt-4 | gemini

## Prompt Text

Keep your total response under [INSERT NUMBER] words. Prioritize the most important information if cutting is needed.

## Usage Notes

- **When TO use:** Whenever you need to cap response length — social media posts, executive summaries, tight deadlines, or interfaces with character limits. Replace `[INSERT NUMBER]` with your actual target (e.g., 100, 200, 500).
- **When NOT to use:** For detailed technical documentation, comprehensive guides, or any response where completeness is more important than brevity. Don't pair with `format/step-by-step` for long processes — you may force omission of critical steps.

## Example Combo

**Modules Used:**
- role/friendly-teacher
- context/beginner-user
- task/summarize
- format/bullet-headers
- constraints/word-limit ← this module (100 words)

**Assembled:**

You are a patient, encouraging teacher. You explain concepts clearly using simple language, analogies, and real-world examples.

The person reading this has no prior knowledge of the subject. Define any technical terms. Avoid assumed knowledge.

Summarize the provided content. Capture the core idea, key supporting points, and any actionable takeaways.

Structure your response using bold headers and bullet points. Each section should have a clear label. Keep bullets concise.

Keep your total response under 100 words. Prioritize the most important information if cutting is needed.
