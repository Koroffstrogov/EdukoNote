import type { RhythmResult } from "../../domain/rhythmExercise";

export function formatRhythmOffset(value: number | null) {
  if (value === null) return "—";
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded} ms`;
}

export function RhythmResultPanel({ result, pulse }: { result: RhythmResult; pulse: boolean }) {
  return <div className="pulse-result">
    <p className="pulse-result__message">{result.message}</p>
    <dl>
      <div><dt>{pulse ? "Pulsations retrouvées" : "Attaques retrouvées"}</dt><dd>{result.matched} / {result.expected}</dd></div>
      <div><dt>Sans frappe</dt><dd>{result.missed}</dd></div>
      <div><dt>Frappes en plus</dt><dd>{result.extra}</dd></div>
      <div><dt>Écart moyen</dt><dd>{formatRhythmOffset(result.meanOffsetMs)}</dd></div>
      <div><dt>Écart médian</dt><dd>{formatRhythmOffset(result.medianOffsetMs)}</dd></div>
    </dl>
    <p className="pulse-input-help">{result.matched
      ? `Écarts estimés sur ${result.matched} frappe${result.matched > 1 ? "s associées" : " associée"} : + = après ${pulse ? "le son" : "l’attaque attendue"} ; − = avant ${pulse ? "le son" : "l’attaque attendue"}.`
      : "Aucune frappe associée : les écarts ne sont pas disponibles."}</p>
    <p>Espacement des frappes : {result.regularity === "steady" ? "stable" : result.regularity === "variable" ? "à travailler" : "pas assez de frappes pour conclure"}.</p>
    <small>{result.success ? "Repère atteint." : "À reprendre tranquillement."} Le bilan est ajouté à ta progression Rythmes. Ces repères restent provisoires.</small>
    {!pulse && <small>Seuls les débuts de notes sont évalués, pas la durée tenue.</small>}
  </div>;
}
