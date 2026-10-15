// Vercel serverless function: POST /api/ask with { recipe, question }.
// Step 1: returns a fake answer (no AI call yet).

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
    if (!recipe || typeof recipe !== "object") {
      return errorResponse(400, "The recipe is missing.");
    }

    return Response.json({
      answer: `Fake answer: you asked "${trimmedQuestion}" about ${recipe.name}.`,
    });
  },
};
