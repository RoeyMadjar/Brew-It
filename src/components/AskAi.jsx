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

  // The textarea grows with its text via CSS (field-sizing: content).
  // Browsers without it (Firefox) get the height set here instead.
  function handleQuestionChange(event) {
    const textarea = event.target;
    if (!CSS.supports("field-sizing", "content")) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    setQuestion(textarea.value);
  }

  return (
    <div className="ai">
      <form className="ai__form" onSubmit={handleSubmit}>
        <label className="bi-field__label" htmlFor={`${id}-question`}>
          Your question
        </label>
        <textarea
          className="bi-input bi-input--version ai__q"
          id={`${id}-question`}
          value={question}
          onChange={handleQuestionChange}
          placeholder="How can I make it less bitter?"
          required
          maxLength={500}
          rows={3}
        />
        <div className="ai__row">
          <button
            type="submit"
            className="bi-btn bi-btn--primary bi-btn--sm"
            disabled={status === "loading"}
            aria-busy={status === "loading"}
          >
            {status === "loading" ? "Asking the AI…" : "Ask"}
          </button>
        </div>
      </form>
      {/* Always rendered so screen readers notice when the text appears. */}
      <p className="bi-visually-hidden" aria-live="polite">
        {status === "loading" ? "Asking the AI…" : ""}
      </p>
      {status === "error" && (
        <div className="bi-error bi-enter" role="alert">
          <span className="bi-error__icon" aria-hidden="true">
            !
          </span>
          <span className="bi-error__label">Error</span>
          <p className="bi-error__text">{errorMessage}</p>
        </div>
      )}
      {status === "success" && (
        <div className="ai__answer bi-enter">
          <p className="ai__text">{answer}</p>
          <p className="ai__note">
            <span className="bi-btn__spark" aria-hidden="true"></span>
            AI suggestion. Try it as a New Version.
          </p>
        </div>
      )}
    </div>
  );
}

export default AskAi;
