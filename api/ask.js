// Vercel serverless function: POST /api/ask with { recipe, question }.
// Asks Claude about one recipe and returns { answer } or { error }.

const MODEL = "claude-haiku-5-5";
// Thinking tokens count toward max_tokens; 600 was too small and caused
// empty answers (502). The visible answer stays short via the "under about
// 120 words" rule in SYSTEM_PROMPT.
const MAX_TOKENS = 2500;
const MAX_QUESTION_LENGTH = 500;
const MAX_RECIPE_LENGTH = 20000;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const AI_ERROR = "The AI couldn't answer right now. Please try again.";

const SYSTEM_PROMPT = `You are a coffee brewing assistant inside Brew It, a coffee recipe journal.

The user sends one recipe as JSON. It has name, bean and method, and "versions" ordered from oldest to newest. The LAST version is the current one; older versions are earlier experiments.
Units: doseGrams and yieldGrams are grams; waterTempC is °C; brewTimeSeconds is always seconds (brewTimeUnit is only how the user likes to see it); rating is out of 10. null means the value wasn't recorded.

Answer the user's question about THIS recipe. Never invent facts about the user's brews (values, tasting notes, results). General coffee knowledge is welcome (techniques, pour plans, typical ranges); base it on this recipe's numbers (dose, yield, temp, grind, method). For filter methods (pour-over, French press, cold brew, moka) the yield is the water used.

The answer is shown in a small panel on the recipe card, so keep it short. Pick the format by question type:
- "What should I change?" or "Why does it taste like X?": one short sentence on the likely cause, then at most 2 numbered changes, one line each: the value, from → to, and why in a few words. The user will try them as a New Version.
- "How do I brew it?", "Give me a plan" or "Explain": short numbered steps, at most about 6 lines, using the recipe's numbers (for example, pour amounts that add up to its yield).

Before answering, check every adjustment's direction. Sour, thin or a fast drawdown means under-extraction → finer grind and/or hotter water. Bitter, harsh or a slow drawdown means over-extraction → coarser grind and/or cooler water.

Mention missing data only if it really matters for this question, in one short line.
Keep it under about 120 words, plain text, no markdown (numbered lines are fine).
Never mention version ids (like "v2"). Say "your current version", or "Version N" where N counts from the oldest version (Version 1).
If the question isn't about coffee, politely say you can only help with this recipe.`;

function errorResponse(status, message) {
  return Response.json({ error: message }, { status });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return errorResponse(405, "Only POST is allowed.");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "The request body must be valid JSON.");
    }

    const { recipe, question } = body ?? {};
    const trimmedQuestion = typeof question === "string" ? question.trim() : "";

    if (trimmedQuestion === "") {
      return errorResponse(400, "Please write a question.");
    }
    if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
      return errorResponse(
        400,
        `The question is too long (max ${MAX_QUESTION_LENGTH} characters).`,
      );
    }
    if (!recipe || typeof recipe !== "object") {
      return errorResponse(400, "The recipe is missing.");
    }
    const recipeJson = JSON.stringify(recipe);
    if (recipeJson.length > MAX_RECIPE_LENGTH) {
      return errorResponse(400, "This recipe is too large to send to the AI.");
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return errorResponse(500, "AI isn't set up on the server.");
    }

    let data;
    try {
      const aiResponse = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          // No "thinking" field = adaptive thinking: the model thinks only as
          // much as needed. Low effort keeps it quick and cheap while still
          // checking that suggestions point the right way.
          output_config: { effort: "low" },
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Recipe (JSON):\n${recipeJson}\n\nQuestion: ${trimmedQuestion}`,
            },
          ],
        }),
      });

      data = await aiResponse.json().catch(() => null);
      if (!aiResponse.ok) {
        console.error("Anthropic error:", aiResponse.status, data?.error?.type);
        return errorResponse(502, AI_ERROR);
      }
    } catch (error) {
      console.error("Anthropic request failed:", error.name);
      return errorResponse(502, AI_ERROR);
    }

    // Keep only text blocks; thinking blocks are skipped.
    const answer = (data?.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (answer === "") {
      console.error("Anthropic returned no text:", data?.stop_reason);
      return errorResponse(502, AI_ERROR);
    }

    return Response.json({ answer });
  },
};
