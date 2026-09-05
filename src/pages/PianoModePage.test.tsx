/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "../App";

beforeEach(() => {
  window.history.replaceState({}, "", "/piano");
});

afterEach(() => cleanup());

describe("Piano mode selector", () => {
  it("offers free play and the existing note-finding exercise", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Choisis ton mode" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Jeu libre/ }).getAttribute("href")).toBe("/piano/play");
    expect(screen.getByRole("link", { name: /Trouve la note/ }).getAttribute("href"))
      .toBe("/exercise?mode=piano");
    expect(screen.getByRole("link", { name: "Accueil" }).getAttribute("href")).toBe("/");
  });

  it("routes /piano/play to the free-play surface", () => {
    window.history.replaceState({}, "", "/piano/play");

    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Joue à ton rythme" })).toBeTruthy();
    expect(screen.getByTestId("piano-keyboard")).toBeTruthy();
  });
});
