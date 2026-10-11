function About() {
  return (
    <section id="about" className="about">
      <h2>About</h2>
      <p>
        Brew It is a coffee journal for people who like to experiment. Save your
        recipes, record every brew, and keep track of what you change along the
        way.
      </p>
      <p>
        Every recipe has versions. When you try something new, like a finer
        grind or a different dose, save it as a new version, and your old ones
        stay in the history. Older versions highlight what's different from what
        you brew now, so you can see what changed.
      </p>
      <p>
        Your recipes are saved only in this browser, on this device. Nothing is
        sent anywhere, and clearing your browser data will delete them.
      </p>
      <p>
        Coming soon: an AI assistant that suggests improvements to your recipes
        and helps you create new ones.
      </p>
      <p>
        Built by Roey Madjar, a junior frontend developer, as a portfolio
        project. Made with React.
      </p>
      <p>
        <a
          href="https://github.com/RoeyMadjar"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>{" "}
        ·{" "}
        <a
          href="https://www.linkedin.com/in/roey-madjar/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </p>
    </section>
  );
}

export default About;
