import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getSymbolById } from "../../domain/musicSymbols";
import { getNoteById } from "../../domain/notes";
import { MusicSymbolDisplay } from "./MusicSymbolDisplay";
import { StaffNote } from "./StaffNote";

describe("music exercise accessibility", () => {
  it("uses a neutral note description when the exercise supplies one", () => {
    const markup = renderToStaticMarkup(
      <StaffNote
        note={getNoteById("si4")}
        accessibleLabel="Note à identifier en clé de sol, sur la ligne 3 en partant du bas."
      />,
    );
    const title = readSvgTitle(markup);

    expect(title).toContain("Note à identifier");
    expect(title).not.toContain("Si");
  });

  it("describes a symbol shape without exposing its answer", () => {
    const symbol = getSymbolById("flat");
    const markup = renderToStaticMarkup(
      <MusicSymbolDisplay
        symbol={symbol}
        accessibleLabel={`Symbole musical à identifier. ${symbol.visualDescription}`}
      />,
    );
    const title = readSvgTitle(markup);

    expect(title).toContain("Symbole musical à identifier");
    expect(title).not.toContain(symbol.label);
  });
});

function readSvgTitle(markup: string): string {
  return markup.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ?? "";
}
