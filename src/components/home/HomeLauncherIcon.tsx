import { TrebleClef } from "../music/TrebleClef";

export type HomeLauncherIconName = "notes" | "symbols" | "challenge";

export function HomeLauncherIcon({ name }: { name: HomeLauncherIconName }) {
  if (name === "symbols") {
    return (
      <span className="home-launcher-icon home-launcher-icon--symbols" data-home-icon={name} aria-hidden="true">
        <TrebleClef className="home-launcher-icon__clef" height={56} />
      </span>
    );
  }

  return (
    <svg
      className={`home-launcher-icon home-launcher-icon--${name}`}
      data-home-icon={name}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {name === "notes" ? (
        <>
          <path d="M37 12v32.5" />
          <path d="M37 13c8 1.5 13 6.5 13 13.5-4.8-4-8.5-5.5-13-5.8" />
          <ellipse className="home-launcher-icon__fill" cx="27" cy="46" rx="11" ry="8" transform="rotate(-18 27 46)" />
        </>
      ) : (
        <>
          <path d="M9 52c9-13 20-21 34-24" />
          <path d="M15 58c9-12 19-19 30-22" />
          <path className="home-launcher-icon__fill" d="m45 6 4.4 9 9.9 1.4-7.2 7 1.7 9.8-8.8-4.6-8.8 4.6 1.7-9.8-7.2-7 9.9-1.4L45 6Z" />
        </>
      )}
    </svg>
  );
}
