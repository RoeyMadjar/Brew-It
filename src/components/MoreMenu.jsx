import { useEffect, useRef } from "react";

// "More" button with a dropdown of a card's less common actions. The open
// state lives in App (one menu open app-wide); this closes the menu on a
// click outside it, on Escape, and after an item is picked.
function MoreMenu({ isOpen, onToggle, onClose, children }) {
  const anchorRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleClick(event) {
      if (!anchorRef.current.contains(event.target)) {
        onClose();
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        buttonRef.current.focus();
      }
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className="menu-anchor" ref={anchorRef}>
      <button
        type="button"
        className="bi-btn bi-btn--quiet bi-btn--sm more-btn"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
        ref={buttonRef}
      >
        More
      </button>
      {isOpen && (
        // A click on any item bubbles up here and closes the menu after the
        // item's own onClick has run.
        <div
          className="menu"
          role="menu"
          aria-label="More actions"
          onClick={onClose}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default MoreMenu;
