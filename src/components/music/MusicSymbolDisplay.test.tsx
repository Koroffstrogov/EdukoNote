/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { MusicSymbolId } from "../../domain/musicSymbols";
import { MusicSymbolDisplay } from "./MusicSymbolDisplay";
import {
  AUGMENTATION_DOT_LAYOUT,
  BEAM_LAYOUT,
  BEAM_PATH,
  BEAM_THICKNESS,
  CLEF_LAYOUTS,
  MUSIC_GLYPH_METRICS,
  NOTE_LAYOUTS,
  STAFF_LINES,
  STAFF_LINE_THICKNESS,
  STAFF_SPACE,
  STEM_THICKNESS,
  SYMBOL_FONT_SIZE,
  THIN_BARLINE_THICKNESS,
} from "./musicSymbolGeometry";

afterEach(() => {
  cleanup();
});

describe("MusicSymbolDisplay engraving", () => {
  it("uses curated SMuFL glyphs", () => {
    const expectedGlyphs: Array<[MusicSymbolId, string[]]> = [
      ["treble-clef", ["gClef"]],
      ["bass-clef", ["fClef"]],
      ["c-clef", ["cClef"]],
      ["whole-note", ["noteheadWhole"]],
      ["half-note", ["noteheadHalf"]],
      ["quarter-note", ["noteheadBlack"]],
      ["eighth-note", ["noteheadBlack", "flag8thUp"]],
      ["beamed-eighth-notes", ["noteheadBlack", "noteheadBlack"]],
      ["augmentation-dot", ["noteheadBlack", "augmentationDot"]],
      ["quarter-rest", ["restQuarter"]],
      ["sharp", ["accidentalSharp"]],
      ["flat", ["accidentalFlat"]],
      ["natural", ["accidentalNatural"]],
    ];

    for (const [symbolId, glyphNames] of expectedGlyphs) {
      const { container, unmount } = render(
        <MusicSymbolDisplay symbol={symbolId} />,
      );
      const renderedGlyphs = Array.from(
        container.querySelectorAll("[data-smufl-name]"),
        (element) => element.getAttribute("data-smufl-name"),
      );

      expect(renderedGlyphs).toEqual(glyphNames);
      expect(container.querySelector("ellipse")).toBeNull();
      expect(
        container.querySelector(".music-symbol-display__rest-stroke"),
      ).toBeNull();
      unmount();
    }

    for (const accidental of ["sharp", "flat", "natural"] as const) {
      const { container, unmount } = render(
        <MusicSymbolDisplay symbol={accidental} />,
      );

      expect(container.querySelector("line")).toBeNull();
      unmount();
    }

  });

  it("normalizes geometry in staff-space units", () => {
    expect(STAFF_SPACE).toBe(12);
    expect(SYMBOL_FONT_SIZE).toBe(STAFF_SPACE * 4);
    expect(
      STAFF_LINES.slice(1).map(
        (line, index) => (line - STAFF_LINES[index]) / STAFF_SPACE,
      ),
    ).toEqual([1, 1, 1, 1]);
    expect(
      (STAFF_LINES[STAFF_LINES.length - 1] - STAFF_LINES[0]) / STAFF_SPACE,
    ).toBe(4);
  });

  it("keeps staff lines and notation strokes at engraving weights", () => {
    expect(STAFF_LINE_THICKNESS / STAFF_SPACE).toBe(0.125);
    expect(STEM_THICKNESS / STAFF_SPACE).toBeCloseTo(0.12);
    expect(THIN_BARLINE_THICKNESS / STAFF_SPACE).toBeCloseTo(0.16);

    const staff = render(<MusicSymbolDisplay symbol="staff" />);
    const line = staff.container.querySelector("line");

    expect(line?.getAttribute("stroke-width")).toBe(
      String(STAFF_LINE_THICKNESS),
    );
    staff.unmount();

    const barLine = render(<MusicSymbolDisplay symbol="bar-line" />);
    const bar = barLine.container.querySelector(
      ".music-symbol-display__bar-line",
    );

    expect(bar?.getAttribute("stroke-width")).toBe(
      String(THIN_BARLINE_THICKNESS),
    );
  });

  it("keeps glyphs inside professional scale ranges", () => {
    expect(
      MUSIC_GLYPH_METRICS.noteheadBlack.width / STAFF_SPACE,
    ).toBeCloseTo(1.18);
    expect(
      MUSIC_GLYPH_METRICS.noteheadWhole.width / STAFF_SPACE,
    ).toBeCloseTo(1.688);

    expect(MUSIC_GLYPH_METRICS.gClef.height / STAFF_SPACE).toBeGreaterThan(
      6.9,
    );
    expect(MUSIC_GLYPH_METRICS.gClef.height / STAFF_SPACE).toBeLessThan(7.2);
    expect(MUSIC_GLYPH_METRICS.fClef.height / STAFF_SPACE).toBeGreaterThan(
      3.5,
    );
    expect(MUSIC_GLYPH_METRICS.fClef.height / STAFF_SPACE).toBeLessThan(3.7);
    expect(MUSIC_GLYPH_METRICS.cClef.height / STAFF_SPACE).toBeCloseTo(
      4.048,
    );

    for (const accidental of [
      MUSIC_GLYPH_METRICS.accidentalFlat,
      MUSIC_GLYPH_METRICS.accidentalNatural,
      MUSIC_GLYPH_METRICS.accidentalSharp,
    ]) {
      expect(accidental.height / STAFF_SPACE).toBeGreaterThan(2.4);
      expect(accidental.height / STAFF_SPACE).toBeLessThan(2.9);
    }

    expect(
      MUSIC_GLYPH_METRICS.restQuarter.height / STAFF_SPACE,
    ).toBeCloseTo(2.992);
  });

  it("renders beams at half a staff space", () => {
    expect(BEAM_THICKNESS / STAFF_SPACE).toBe(0.5);
    expect(BEAM_LAYOUT.thickness).toBe(BEAM_THICKNESS);

    const { container } = render(
      <MusicSymbolDisplay symbol="beamed-eighth-notes" />,
    );
    const beam = container.querySelector(".music-symbol-display__beam");

    expect(beam?.getAttribute("d")).toBe(BEAM_PATH);
    expect(beam?.getAttribute("data-beam-thickness")).toBe(
      String(BEAM_THICKNESS),
    );
  });

  it("keeps the augmentation dot compact and close to its note", () => {
    const headRight =
      NOTE_LAYOUTS.dotted.headCenterX +
      MUSIC_GLYPH_METRICS.noteheadBlack.width / 2;
    const dotLeft =
      AUGMENTATION_DOT_LAYOUT.centerX -
      AUGMENTATION_DOT_LAYOUT.diameter / 2;

    expect(AUGMENTATION_DOT_LAYOUT.diameter / STAFF_SPACE).toBeCloseTo(0.4);
    expect((dotLeft - headRight) / STAFF_SPACE).toBeCloseTo(0.5);

    const { container } = render(
      <MusicSymbolDisplay symbol="augmentation-dot" />,
    );
    const dot = container.querySelector(
      '[data-smufl-name="augmentationDot"]',
    );

    expect(dot?.getAttribute("font-size")).toBe(String(SYMBOL_FONT_SIZE));
  });

  it("registers clefs on their reference staff lines", () => {
    expect(CLEF_LAYOUTS.gClef.registrationY).toBe(STAFF_LINES[3]);
    expect(CLEF_LAYOUTS.fClef.registrationY).toBe(STAFF_LINES[1]);
    expect(CLEF_LAYOUTS.cClef.registrationY).toBe(STAFF_LINES[2]);

    const cases: Array<[MusicSymbolId, string, number]> = [
      ["treble-clef", "gClef", STAFF_LINES[3]],
      ["bass-clef", "fClef", STAFF_LINES[1]],
      ["c-clef", "cClef", STAFF_LINES[2]],
    ];

    for (const [symbolId, glyphName, expectedY] of cases) {
      const { container, unmount } = render(
        <MusicSymbolDisplay symbol={symbolId} />,
      );
      const glyph = container.querySelector(
        `[data-smufl-name="${glyphName}"]`,
      );

      expect(glyph?.getAttribute("y")).toBe(String(expectedY));
      unmount();
    }
  });
});
