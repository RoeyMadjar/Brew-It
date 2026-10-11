// First screen: title, tagline and links to the page's sections.
function Landing() {
  return (
    <section className="landing">
      <h1>Brew It</h1>
      <p>Your personal coffee journal</p>
      <div className="landing-actions">
        <a className="button-link" href="#recipes">
          Your recipes
        </a>
        <div className="landing-coming-soon">
          <button type="button" disabled aria-describedby="ai-coming-soon">
            Create with AI
          </button>
          <span id="ai-coming-soon" className="coming-soon">
            Coming soon
          </span>
        </div>
        <a className="button-link" href="#about">
          About
        </a>
      </div>
    </section>
  );
}

export default Landing;
