/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePulseSession } from "../hooks/usePulseSession";
import { RhythmsPage } from "./RhythmsPage";

vi.mock("../hooks/usePulseSession", () => ({ usePulseSession: vi.fn() }));
let session: ReturnType<typeof usePulseSession>;
beforeEach(() => {
  session = { phase: "idle", beat: -1, tapCount: 0, result: null, start: vi.fn(async () => undefined), stop: vi.fn(), tap: vi.fn() };
  vi.mocked(usePulseSession).mockImplementation(() => session);
  // jsdom has no PointerEvent constructor; retain the button and timestamp fields.
  vi.stubGlobal("PointerEvent", MouseEvent);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("pulse workshop interactions", () => {
  it("offers three tempos and twenty teacher-review patterns", () => {
    const { container } = render(<RhythmsPage />);
    expect(screen.getByRole("button", { name: "72 bpm" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "90 bpm" }));
    fireEvent.click(screen.getByRole("button", { name: "Commencer" }));
    expect(session.start).toHaveBeenCalledWith(90);
    expect(container.querySelectorAll(".rhythm-pattern")).toHaveLength(20);
    expect(container.querySelectorAll('.rhythm-notation[role="img"]')).toHaveLength(20);
    expect(container.querySelectorAll('[data-smufl-name="augmentationDot"]')).toHaveLength(3);
    expect(container.querySelectorAll(".rhythm-tie")).toHaveLength(3);
    expect(container.querySelectorAll(".rhythm-triplet")).toHaveLength(4);
  });

  it("counts a pointer down once and ignores its subsequent click and right button", () => {
    session.phase = "playing";
    session.beat = 4;
    render(<RhythmsPage />);
    const pad = screen.getByRole("button", { name: "Frapper la pulsation" });
    fireEvent.pointerDown(pad, { button: 0 });
    fireEvent.click(pad, { detail: 1 });
    fireEvent.pointerDown(pad, { button: 2 });
    expect(session.tap).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "90 bpm" })).toBeNull();
  });

  it("accepts separate keyboard attacks and accessible activation without held-key repeats", () => {
    session.phase = "count-in";
    render(<RhythmsPage />);
    const pad = screen.getByRole("button", { name: "Frapper la pulsation" });
    expect(document.activeElement).toBe(pad);
    fireEvent.keyDown(pad, { key: " " });
    fireEvent.keyDown(pad, { key: " ", repeat: true });
    fireEvent.keyUp(pad, { key: " " });
    fireEvent.keyDown(pad, { key: "Enter" });
    fireEvent.click(pad, { detail: 0 });
    expect(session.tap).toHaveBeenCalledTimes(3);
  });

  it("offers a deliberate restart and focuses the interruption message", () => {
    session.phase = "playing";
    const { rerender } = render(<RhythmsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Arrêter" }));
    expect(session.stop).toHaveBeenCalledOnce();
    session.phase = "interrupted";
    rerender(<RhythmsPage />);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "La séance est arrêtée" }));
    expect(session.start).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Recommencer" }));
    expect(session.start).toHaveBeenCalledWith(72);
  });
});
