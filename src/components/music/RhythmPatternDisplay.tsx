import { useId } from "react";
import { describeRhythmPattern, QUARTER_TICKS, RHYTHM_FIGURES, type RhythmPattern } from "../../domain/rhythmPatterns";
import { SmuflGlyph } from "./SmuflGlyph";
import { getCenteredSmuflGlyphOrigin, type SmuflGlyphName } from "./smuflGlyphs";

const FONT_SIZE = 40;
const HEAD_Y = 68;
const STEM_Y = 32;
const STEM_OFFSET = 5.5;

function Glyph({ name, x, y }: { name: SmuflGlyphName; x: number; y: number }) {
  return <SmuflGlyph name={name} fontSize={FONT_SIZE} {...getCenteredSmuflGlyphOrigin(name, FONT_SIZE, x, y)} />;
}

/** Two short bars on an unpitched line. Subdivisions are beamed by quarter beat. */
export function RhythmPatternDisplay({ pattern }: { pattern: RhythmPattern }) {
  const titleId = useId();
  return <div className="rhythm-notation" role="img" aria-labelledby={titleId}>
    <span id={titleId} className="sr-only">{pattern.beatsPerBar}/4 : {describeRhythmPattern(pattern)}</span>
    {pattern.bars.map((bar, barIndex) => {
      let tick = 0;
      const events = bar.map((event) => {
        const at = tick;
        tick += RHYTHM_FIGURES[event.figure].ticks;
        return { ...event, at, x: 44 + at / (pattern.beatsPerBar * QUARTER_TICKS) * 248 };
      });
      const groups = new Map<number, typeof events>();
      events.forEach((event) => {
        if (!["C", "D", "T"].includes(event.figure)) return;
        const beat = Math.floor(event.at / QUARTER_TICKS);
        groups.set(beat, [...(groups.get(beat) ?? []), event]);
      });
      return <svg key={barIndex} viewBox="0 0 320 104" aria-hidden="true" focusable="false">
        <line className="rhythm-staff" x1="10" x2="310" y1={HEAD_Y} y2={HEAD_Y} />
        <line className="rhythm-stem" x1="310" x2="310" y1="52" y2="80" />
        <text className="rhythm-meter" x="18" y="61">{pattern.beatsPerBar}</text>
        <text className="rhythm-meter" x="18" y="78">4</text>
        {events.map((event, index) => {
          const group = groups.get(Math.floor(event.at / QUARTER_TICKS));
          const rest = event.figure === "S" || event.figure === "DS";
          return <g key={index}>
            {event.figure === "DS" ? <rect x={event.x - 7} y={HEAD_Y - 5} width="14" height="5" />
              : <Glyph name={event.figure === "S" ? "restQuarter" : event.figure === "R" ? "noteheadWhole" : event.figure === "B" ? "noteheadHalf" : "noteheadBlack"} x={event.x} y={HEAD_Y} />}
            {!rest && event.figure !== "R" && <line className="rhythm-stem" x1={event.x + STEM_OFFSET} x2={event.x + STEM_OFFSET} y1={HEAD_Y} y2={STEM_Y} />}
            {event.figure === "NP" && <Glyph name="augmentationDot" x={event.x + 14} y={HEAD_Y - 5} />}
            {event.figure === "C" && group?.length === 1 && <SmuflGlyph name="flag8thUp" fontSize={FONT_SIZE} x={event.x + STEM_OFFSET - 0.5} y={STEM_Y} />}
            {event.tieToNext && <path className="rhythm-tie" d={`M ${event.x + 2} 79 Q ${(event.x + (events[index + 1]?.x ?? 307)) / 2} 99 ${events[index + 1]?.x ?? 307} 79`} />}
          </g>;
        })}
        {barIndex > 0 && pattern.bars[barIndex - 1].slice(-1)[0]?.tieToNext && <path className="rhythm-tie" d="M 29 79 Q 36 91 44 79" />}
        {[...groups.entries()].map(([beat, group]) => {
          if (group.length < 2) return null;
          const doubles = group.filter((event) => event.figure === "D");
          const left = group[0].x + STEM_OFFSET;
          const right = group[group.length - 1].x + STEM_OFFSET;
          return <g key={beat}>
            <path className="rhythm-beam" d={`M ${left} ${STEM_Y} H ${right}`} />
            {doubles.length >= 2 && <path className="rhythm-beam" d={`M ${doubles[0].x + STEM_OFFSET} ${STEM_Y + 7} H ${doubles[doubles.length - 1].x + STEM_OFFSET}`} />}
            {group[0].figure === "T" && <text className="rhythm-triplet" x={(left + right) / 2} y="22">3</text>}
          </g>;
        })}
      </svg>;
    })}
  </div>;
}
