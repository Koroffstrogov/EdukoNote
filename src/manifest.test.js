import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("PWA manifest", () => {
  it("allows the Piano route to rotate to landscape", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    );

    expect(manifest.orientation).toBe("any");
  });
});
