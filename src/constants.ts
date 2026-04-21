export const PROMPT_TEXT = `You are a data transformation assistant. I will give you raw JSON exported from Firefox via the About Sync extension. Your job is to transform it into a clean, flat array matching an exact target schema.

## INPUT FORMAT
The raw data looks like this:
{
  "clientName": "Firefox on Device Name",
  "id": "some-hex-id",
  "tabs": [
    {
      "icon": null,
      "lastUsed": 1776529824,
      "title": "Page Title Here",
      "urlHistory": ["https://example.com/page"],
      "inactive": true
    }
  ]
}

## OUTPUT FORMAT
Output ONLY a valid JSON array — no markdown, no explanation, no code fences. Each element must match this schema exactly:
[
  {
    "id": "string — generate a unique short ID for each bookmark (e.g. 'bm_0001')",
    "title": "string — the tab title as-is",
    "url": "string — the FIRST entry in urlHistory only",
    "lastUsed": 1776529824,
    "category": "string — infer a single short category from the URL domain and title (e.g. 'Tech', 'News', 'AI', 'Gaming', 'Science', 'Politics', 'Productivity', 'Tools', 'Reference', 'Entertainment')",
    "tags": ["lowercase", "keyword", "strings"]
  }
]

## RULES
1. Process EVERY tab in the tabs array — do not skip any.
2. Use ONLY the first URL in urlHistory.
3. The lastUsed field must remain a number (Unix timestamp in seconds) — do NOT convert it to a date string.
4. The category must be a single short word or two-word phrase. Be consistent — similar topics should get the same category.
5. Tags must be lowercase, single words or hyphenated phrases (e.g. "machine-learning", "open-source"). Include 2 to 5 tags per bookmark.
6. Output must be parseable by JSON.parse() with no modifications — no trailing commas, no comments.
7. Do not include the "icon" or "inactive" fields in the output.

## INPUT DATA
[Paste your raw Firefox JSON here]`
