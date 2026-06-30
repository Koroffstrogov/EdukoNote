import type { ColorTokenId } from "../../theme/tokens";

export type HomeActionCardProps = {
  title: string;
  text: string;
  icon: string;
  href?: string;
  tone?: Extract<ColorTokenId, "rose" | "lavender" | "vanilla">;
  featured?: boolean;
};

export function HomeActionCard({ title, text, icon, href, tone = "rose", featured = false }: HomeActionCardProps) {
  const content = (
    <>
      <span className="home-action-card__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="home-action-card__content">
        <h3 className="home-action-card__title">{title}</h3>
        <p className="home-action-card__text">{text}</p>
      </span>
    </>
  );
  const classes = `home-action-card home-action-card--${tone}${featured ? " home-action-card--featured" : ""}`;

  if (href) {
    return (
      <a className={classes} href={href}>
        {content}
      </a>
    );
  }

  return (
    <article className={classes}>
      {content}
    </article>
  );
}
