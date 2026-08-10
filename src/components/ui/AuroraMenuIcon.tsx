export type AuroraMenuIconName =
  | "play"
  | "note"
  | "challenge"
  | "review"
  | "speed"
  | "symbols"
  | "arrow"
  | "complete"
  | "review-needed"
  | "undiscovered";

export type AuroraMenuIconProps = {
  name: AuroraMenuIconName;
  className?: string;
};

export function AuroraMenuIcon({ name, className = "" }: AuroraMenuIconProps) {
  const classes = `aurora-menu-icon aurora-menu-icon--${name}${className ? ` ${className}` : ""}`;

  return (
    <svg
      className={classes}
      data-aurora-icon={name}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      {getIconPaths(name)}
    </svg>
  );
}

function getIconPaths(name: AuroraMenuIconName) {
  switch (name) {
    case "play":
      return <path className="aurora-menu-icon__fill" d="M11.25 8.2 24.5 16l-13.25 7.8V8.2Z" />;
    case "note":
      return (
        <>
          <path d="M11.2 21.4V8.6l12-2.4v12.7" />
          <path d="m11.2 11.5 12-2.4" />
          <ellipse className="aurora-menu-icon__fill" cx="8.2" cy="22.6" rx="4.2" ry="3.2" />
          <ellipse className="aurora-menu-icon__fill" cx="20.2" cy="20.1" rx="4.2" ry="3.2" />
        </>
      );
    case "challenge":
      return (
        <>
          <circle cx="16" cy="16" r="10.5" />
          <circle cx="16" cy="16" r="5.2" />
          <circle className="aurora-menu-icon__fill" cx="16" cy="16" r="1.8" />
          <path d="M16 2.5v3M29.5 16h-3M16 29.5v-3M2.5 16h3" />
        </>
      );
    case "review":
      return (
        <>
          <path d="M8.2 9.3A10 10 0 1 1 6 19.5" />
          <path d="M8.1 4.6v5.1H3" />
          <path d="m11.3 16 3.2 3.2 6.5-7" />
        </>
      );
    case "speed":
      return (
        <>
          <path d="M5.2 23.8a12 12 0 1 1 21.6 0" />
          <path d="M16 6.2v3M7.4 10.1l2.1 2.1M24.6 10.1l-2.1 2.1" />
          <path d="m16 20 6.6-5.1" />
          <circle className="aurora-menu-icon__fill" cx="16" cy="20" r="2" />
        </>
      );
    case "symbols":
      return (
        <>
          <path d="M11.5 5.2 10 27M22 4l-1.5 21.8M6.2 12.4l20-3.1M5.4 21.9l20-3.1" />
          <circle className="aurora-menu-icon__fill" cx="16" cy="15.6" r="1.45" />
        </>
      );
    case "arrow":
      return <path d="M8 16h15M17 9.5l6.5 6.5-6.5 6.5" />;
    case "complete":
      return (
        <>
          <circle cx="16" cy="16" r="10.5" />
          <path d="m10.7 16.2 3.5 3.5 7.2-7.6" />
        </>
      );
    case "review-needed":
      return (
        <>
          <circle cx="16" cy="16" r="10.5" />
          <path d="M16 9.5v7.8" />
          <circle className="aurora-menu-icon__fill" cx="16" cy="22" r="1.2" />
        </>
      );
    case "undiscovered":
      return (
        <>
          <path d="M16 7.2v17.6M7.2 16h17.6" />
          <circle cx="16" cy="16" r="3.4" />
        </>
      );
  }
}
