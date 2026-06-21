import type { HTMLAttributes, ReactNode } from "react";
import type { ColorTokenId } from "../../theme/tokens";

export type AppCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  tone?: ColorTokenId;
  as?: "article" | "section" | "div";
};

export function AppCard({ children, tone = "cream", as: Element = "article", className = "", ...props }: AppCardProps) {
  const classes = ["app-card", `app-card--${tone}`, className].filter(Boolean).join(" ");

  return (
    <Element className={classes} {...props}>
      {children}
    </Element>
  );
}
