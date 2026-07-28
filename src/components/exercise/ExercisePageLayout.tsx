import type { ReactNode } from "react";
import { AppButton } from "../ui/AppButton";

type ExercisePageLayoutProps = {
  eyebrow: ReactNode;
  title?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function ExercisePageLayout({
  eyebrow,
  title,
  className = "",
  children,
}: ExercisePageLayoutProps) {
  return (
    <main className={["app-shell", className].filter(Boolean).join(" ")}>
      <nav className="app-topbar" aria-label="Navigation principale">
        <a className="brand-mark" href="/" aria-label="Accueil EdukoNote">
          <span className="brand-mark__symbol" aria-hidden="true">
            ♪
          </span>
          EdukoNote
        </a>
        <AppButton href="/" tone="cream">
          Accueil
        </AppButton>
      </nav>

      <header className="page-hero">
        <p className="page-eyebrow">{eyebrow}</p>
        {title ? <h1 className="page-title">{title}</h1> : null}
      </header>

      {children}
    </main>
  );
}
