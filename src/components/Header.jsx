import { useEffect, useState } from "react";

// The navbar's bottom edge: 12px from the top of the screen + 56px tall.
const NAVBAR_BOTTOM_PX = 68;

// The big "Brew It" title and logo scroll away with the landing. The fixed
// navbar fades in once the landing buttons have passed under it.
function Header() {
  const [isNavbarShown, setIsNavbarShown] = useState(false);

  // IntersectionObserver tells us when the landing buttons go under the
  // navbar (or come back), instead of checking on every scroll event.
  // The negative top margin moves the observed area's top edge down to the
  // navbar's bottom edge.
  useEffect(() => {
    const actions = document.querySelector(".landing__actions");
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Shown only when the buttons are gone above the navbar, not below.
        setIsNavbarShown(
          !entry.isIntersecting &&
            entry.boundingClientRect.top < NAVBAR_BOTTOM_PX,
        );
      },
      { rootMargin: `-${NAVBAR_BOTTOM_PX}px 0px 0px 0px` },
    );
    observer.observe(actions);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="head">
      <nav className="head__bar" aria-label="Main" data-shown={isNavbarShown}>
        {/* Phones only: the small title in the navbar. A visual copy; the big
            title below stays the accessible link to the top. */}
        <a className="head__mini" href="#top" tabIndex={-1} aria-hidden="true">
          Brew It
        </a>
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
      {/* Phones only: the big landing logo, which scrolls away with the page.
          A visual copy; the navbar logo stays the accessible link. */}
      <a
        className="head__landlogo"
        href="#top"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img src="/logo.png" alt="" />
      </a>
    </header>
  );
}

export default Header;
