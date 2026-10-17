import { useId, useState } from "react";

const NETWORK_ERROR =
  "Couldn't reach the AI. Check your connection and try again.";

// Ask the AI about one recipe. The API key stays on the server (/api/ask).
function AskAi({ recipe }) {
  const id = useId();
  const [question, setQuestion] = useState("");
  // One status instead of several booleans, so "loading and error at once"
  // can't happen: "idle" | "loading" | "error" | "success".
  const [status, setStatus] = useState("idle");
  const [answer, setAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion === "" || status === "loading") {
      return;
    }

    setAnswer("");
    setErrorMessage("");
    setStatus("loading");

    // If the panel closes mid-request, the late updates below are ignored.
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe, question: trimmedQuestion }),
      });
      // Throws if the body isn't JSON (e.g. the 404 page from `npm run dev`).
      const data = await response.json();
      if (!response.ok) {
        console.error("Ask AI failed:", response.status, data.error);
        setErrorMessage(data.error ?? NETWORK_ERROR);
        setStatus("error");
        return;
      }
      setAnswer(data.answer);
      setStatus("success");
    } catch (error) {
      console.error("Ask AI failed:", error);
      setErrorMessage(NETWORK_ERROR);
      setStatus("error");
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
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Asking the AI…" : "Ask"}
        </button>
      </form>
      {/* Always rendered so screen readers notice when the text appears. */}
      <p className="visually-hidden" aria-live="polite">
        {status === "loading" ? "Asking the AI…" : ""}
      </p>
      {status === "error" && (
        <p className="ask-ai-error" role="alert">
          {errorMessage}
        </p>
      )}
      {status === "success" && (
        <>
          <p className="ask-ai-answer">{answer}</p>
          <p className="ask-ai-note">AI suggestion. Try it as a New Version.</p>
        </>
      )}
    </div>
  );
}

export default AskAi;
