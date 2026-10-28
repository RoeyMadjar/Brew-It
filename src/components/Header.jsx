import { useEffect, useRef } from "react";

// Fixed header: the big "Brew It" title shrinks into a compact navbar as the
// page scrolls. The scroll progress (0 → 1) is written to the --p CSS
// variable on .site, and site.css sizes the title, logo and pill from it.
function Header() {
  const headerRef = useRef(null);

  useEffect(() => {
    const site = headerRef.current.closest(".site");

    // Written straight to the DOM, not to state: scroll fires many times a
    // second and state would re-render the whole app each time.
    function handleScroll() {
      const progress = Math.max(
        0,
        Math.min(1, window.scrollY / (window.innerHeight * 0.5)),
      );
      site.style.setProperty("--p", progress.toFixed(3));
      site.dataset.compact = progress > 0.75 ? "true" : "false";
    }

    // Scroll events inside an input or textarea don't bubble up to window,
    // so typing long text there can't snap the title back to full size.
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <header className="head" ref={headerRef}>
      <nav className="head__bar" aria-label="Main">
        <ul className="head__links">
          <li>
            <a className="head__link" href="#recipes">
              Your recipes
            </a>
          </li>
          <li>
            <a className="head__link" href="#about">
              About
            </a>
          </li>
        </ul>
        <a
          className="head__logo-link"
          href="#top"
          aria-label="Brew It, back to top"
        >
          <img className="head__logo" src="/logo.png" alt="" />
        </a>
      </nav>
      <h1 className="head__h1">
        <a className="head__title" href="#top">
          Brew It
        </a>
      </h1>
    </header>
  );
}

export default Header;
