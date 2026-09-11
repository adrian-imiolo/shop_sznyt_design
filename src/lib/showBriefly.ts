/**
 * Shows something now and hides it after `ms`, returning a cleanup that cancels
 * the pending hide.
 *
 * Shaped as an effect body — `useEffect(() => showBriefly(setVisible, MS), [k])`
 * — so React cancels the in-flight timer whenever the effect re-runs. That
 * cleanup is the whole point: without it, timers stack and an early one hides a
 * window a later call had just restarted (#167).
 *
 * React-free on purpose, so the lifecycle is unit-testable in the node-env suite.
 */
export function showBriefly(show: (visible: boolean) => void, ms: number) {
  show(true);
  const timer = setTimeout(() => show(false), ms);

  return () => clearTimeout(timer);
}
