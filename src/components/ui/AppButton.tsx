import type { MouseEventHandler, ReactNode } from "react";
import type { ColorTokenId } from "../../theme/tokens";

type ButtonTone = ColorTokenId;

export type AppButtonProps = {
  children: ReactNode;
  tone?: ButtonTone;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
};

export function AppButton({
  children,
  tone = "lavender",
  className = "",
  href,
  type = "button",
  disabled = false,
  onClick,
  "aria-label": ariaLabel,
}: AppButtonProps) {
  const classes = ["app-button", `app-button--${tone}`, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <a className={classes} href={href} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type={type} disabled={disabled} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
