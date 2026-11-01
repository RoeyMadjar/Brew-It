import { useEffect, useRef } from "react";

// The compact navbar title's font size; the full-size title scales down to it.
const COMPACT_TITLE_PX = 22;

// Fixed header: the big "Brew It" title shrinks into a compact navbar as the
// page scrolls. The scroll progress (0 → 1) is written to the --p CSS
// variable, and site.css moves and scales the title, logo and pill from it.
function Header() {
  const headerRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const header = headerRef.current;
    const site = header.closest(".site");
    // --p goes only where it's used (the header, and the landing's tagline
    // on phones), not on .site: a change there restyles the whole page.
    const landing = site.querySelector(".landing");
    let frameId = null;

    // Written straight to the DOM, not to state: scroll fires many times a
    // second and state would re-render the whole app each time.
    function update() {
      frameId = null;
      const progress = Math.max(
        0,
        Math.min(1, window.scrollY / (window.innerHeight * 0.5)),
      );
      header.style.setProperty("--p", progress.toFixed(3));
      landing.style.setProperty("--p", progress.toFixed(3));
      site.dataset.compact = progress > 0.75 ? "true" : "false";
    }

    // At most one update per frame, however many scroll events arrive.
    function handleScroll() {
      if (frameId === null) {
        frameId = requestAnimationFrame(update);
      }
    }

    // The title's full size depends on the window width; CSS can't divide
    // two lengths, so the scale it shrinks to is worked out here.
    function handleResize() {
      const fullSize = parseFloat(getComputedStyle(titleRef.current).fontSize);
      header.style.setProperty("--title-min", COMPACT_TITLE_PX / fullSize);
      handleScroll();
    }

    // Scroll events inside an input or textarea don't bubble up to window,
    // so typing long text there can't snap the title back to full size.
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
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
        <a className="head__title" href="#top" ref={titleRef}>
          Brew It
        </a>
      </h1>
    </header>
  );
}

export default Header;
