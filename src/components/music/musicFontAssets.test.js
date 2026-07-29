import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const fontUrl = new URL(
  "../../../public/fonts/eduko-music-symbols.woff",
  import.meta.url,
);
const licenseUrl = new URL("../../../public/fonts/OFL.txt", import.meta.url);
const provenanceUrl = new URL(
  "../../../public/fonts/README.md",
  import.meta.url,
);

describe("music font assets", () => {
  it("ships a lightweight licensed and traceable SMuFL subset", () => {
    expect(statSync(fontUrl).size).toBeLessThan(25_000);
    expect(readFileSync(licenseUrl, "utf8")).toContain(
      "SIL OPEN FONT LICENSE Version 1.1",
    );
    expect(readFileSync(provenanceUrl, "utf8")).toContain(
      "Eduko Music Symbols",
    );
  });
});
