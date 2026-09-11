import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { showBriefly } from "./showBriefly";

describe("showBriefly", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows at once and hides only after the full duration", () => {
    const show = vi.fn();

    showBriefly(show, 3000);

    expect(show).toHaveBeenCalledExactlyOnceWith(true);

    vi.advanceTimersByTime(2999);
    expect(show).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(show).toHaveBeenLastCalledWith(false);
  });

  it("cancels the pending hide when its cleanup runs", () => {
    const show = vi.fn();

    const cleanup = showBriefly(show, 3000);
    cleanup();
    vi.advanceTimersByTime(10_000);

    expect(show).not.toHaveBeenCalledWith(false);
  });

  // The #167 regression. The shipped code called setTimeout without ever
  // clearing it, so a second add re-showed the toast while the first timer was
  // still pending — and that timer then hid it 1s into what should have been a
  // fresh 3s window. React runs the previous effect's cleanup before re-running
  // the effect, so `cleanup()` here stands in for what the component now does.
  it("gives a restarted window its full duration rather than inheriting the first timer", () => {
    const show = vi.fn();

    const cleanup = showBriefly(show, 3000); // t=0
    vi.advanceTimersByTime(2000); // t=2000
    cleanup();
    showBriefly(show, 3000); // t=2000, restarted

    vi.advanceTimersByTime(1000); // t=3000 — the first timer's deadline
    expect(show).not.toHaveBeenCalledWith(false);

    vi.advanceTimersByTime(2000); // t=5000 — 3000ms after the restart
    expect(show).toHaveBeenLastCalledWith(false);
  });
});
