import type { ReactNode } from "react";
import { AppButton } from "../ui/AppButton";
import { StudioBrand } from "../ui/StudioBrand";

type ExercisePageLayoutProps = {
  eyebrow: ReactNode;
  title?: ReactNode;
  className?: string;
  navLabel?: string;
  children: ReactNode;
};

export function ExercisePageLayout({
  eyebrow,
  title,
  className = "",
  navLabel = "Quitter",
  children,
}: ExercisePageLayoutProps) {
  return (
    <main className={["app-shell", "studio-shell", className].filter(Boolean).join(" ")}>
      <nav className="app-topbar" aria-label="Navigation principale">
        <StudioBrand />
        <AppButton className="studio-exit-button" href="/" tone="cream">
          <span aria-hidden="true">←</span> {navLabel}
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
