const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer and UI/UX analyst. Your job is to analyze code or UI screenshots and return a structured, actionable review.

When reviewing CODE, analyze:
- Bugs, logic errors, and edge cases
- Security vulnerabilities (XSS, injection, auth issues, etc.)
- Performance bottlenecks and memory issues
- Code style, readability, and naming conventions
- Architecture and design pattern concerns
- Missing error handling or validation

When reviewing a UI SCREENSHOT, analyze:
- Accessibility issues (contrast, keyboard navigation, ARIA)
- Usability problems and confusing UX patterns
- Layout inconsistencies and visual hierarchy issues
- Responsiveness concerns
- Suggest the component structure (React components) to implement it

Return your response in this EXACT JSON format with no markdown, no backticks, just raw JSON:
{
  "summary": "2-3 sentence overall assessment",
  "inputType": "code",
  "language": "detected language or UI/Screenshot",
  "severity": "low or medium or high or critical",
  "issues": [
    {
      "id": "unique-id",
      "type": "bug or security or performance or style or ux or accessibility or architecture",
      "severity": "low or medium or high or critical",
      "title": "Short issue title",
      "description": "Detailed explanation of the problem",
      "line": null,
      "suggestion": "Concrete fix or improvement"
    }
  ],
  "positives": ["What the code/UI does well"],
  "refactoredSnippet": null
}

Be specific, practical, and constructive. Prioritize the most impactful issues. Return ONLY raw JSON.`;

/**
 * Streams a code/image review from Groq (LLaMA Vision).
 * Calls onChunk(text) for each streamed chunk, resolves with full parsed result.
 */
export async function streamReview({ code, file, filename }, onChunk) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not set in .env");
  }

  // Build message content
  const content = [];

  if (file) {
    const isImage = file.mimetype?.startsWith("image/");
    if (isImage) {
      const base64 = file.buffer.toString("base64");
      content.push({
        type: "image_url",
        image_url: { url: `data:${file.mimetype};base64,${base64}` },
      });
      content.push({
        type: "text",
        text: `Review this UI screenshot (file: ${filename || "screenshot"}). Return only raw JSON.`,
      });
    } else {
      const fileContent = file.buffer.toString("utf-8");
      content.push({
        type: "text",
        text: `Review this code from file "${filename}":\n\n\`\`\`\n${fileContent}\n\`\`\`\n\nReturn only raw JSON.`,
      });
    }
  } else if (code) {
    content.push({
      type: "text",
      text: `Review this code:\n\n\`\`\`\n${code}\n\`\`\`\n\nReturn only raw JSON.`,
    });
  } else {
    throw new Error("No input provided — send code text or upload a file/image");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: REVIEW_SYSTEM_PROMPT },
        { role: "user", content },
      ],
      temperature: 0.2,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const chunk = parsed.choices?.[0]?.delta?.content || "";
        if (chunk) {
          fullText += chunk;
          onChunk(chunk);
        }
      } catch {}
    }
  }

  // Parse the JSON result — strip markdown fences if present
  const cleaned = fullText.replace(/```json\n?|\n?```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting JSON object from response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse Groq response as JSON");
  }
}