import { useId, useState } from "react";

// Ask the AI about one recipe. The API key stays on the server (/api/ask).
function AskAi({ recipe }) {
  const id = useId();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion === "") {
      return;
    }

    // Loading and error UI come later; for now errors only go to the console.
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe, question: trimmedQuestion }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Ask AI failed:", response.status, data.error);
        return;
      }
      setAnswer(data.answer);
    } catch (error) {
      console.error("Ask AI failed:", error);
    }
  }

  return (
    <div className="ask-ai">
      <form onSubmit={handleSubmit}>
        <label htmlFor={`${id}-question`}>Your question</label>
        <textarea
          id={`${id}-question`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="How can I make it less bitter?"
          required
          maxLength={500}
          rows={3}
        />
        <button type="submit">Ask</button>
      </form>
      {answer && (
        <>
          <p className="ask-ai-answer">{answer}</p>
          <p className="ask-ai-note">AI suggestion. Try it as a New Version.</p>
        </>
      )}
    </div>
  );
}

export default AskAi;
