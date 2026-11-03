// First screen: tagline and links to the page's sections. The big
// "Brew It" title and logo live in Header, next to the navbar.
function Landing() {
  return (
    <section
      className="sec landing bi-grain"
      data-gradient="ember"
      aria-label="Welcome"
    >
      <div className="wrap landing__inner">
        <p className="landing__tagline">Your Personal Coffee Journal</p>
        <div className="landing__actions">
          <a className="bi-btn bi-btn--primary" href="#recipes">
            Your recipes
          </a>
          <a className="bi-btn bi-btn--secondary" href="#about">
            About
          </a>
          <span className="bi-btn-with-note">
            <button
              type="button"
              className="bi-btn"
              disabled
              aria-describedby="ai-coming-soon"
            >
              Create with AI
            </button>
            <span className="bi-btn-note" id="ai-coming-soon">
              Coming soon
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}

export default Landing;
