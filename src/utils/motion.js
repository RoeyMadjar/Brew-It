// Delete animation length: a little over --duration-delete (320ms in
// tokens.css), so the item is fully gone before it leaves state.
export const DELETE_MS = 340;
// Form fade-out on Cancel (--duration-fast, 160ms).
export const FORM_LEAVE_MS = 170;
// Create card collapsing closed (.collapse, --duration-base, 260ms).
export const CREATE_CLOSE_MS = 280;

// How long to wait for a CSS animation before changing state. With reduced
// motion the CSS durations collapse to ~0, so don't wait either.
export function motionDelay(ms) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
}

// Right after an item is removed, transitions are off for one frame
// (data-settling on .site), so the items below move up instead of replaying
// an open/close animation. Two frames: React renders in the first.
export function afterNextFrame(callback) {
  requestAnimationFrame(() => requestAnimationFrame(callback));
}
