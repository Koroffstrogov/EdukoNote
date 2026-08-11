import type { MouseEventHandler, ReactNode, Ref } from "react";

type HomeModeTileBaseProps = {
  label: string;
  icon: ReactNode;
};

type HomeModeTileLinkProps = HomeModeTileBaseProps & {
  href: string;
  onClick?: never;
  buttonRef?: never;
  expanded?: never;
  controls?: never;
};

type HomeModeTileButtonProps = HomeModeTileBaseProps & {
  href?: never;
  onClick: MouseEventHandler<HTMLButtonElement>;
  buttonRef?: Ref<HTMLButtonElement>;
  expanded?: boolean;
  controls?: string;
};

export type HomeModeTileProps = HomeModeTileLinkProps | HomeModeTileButtonProps;

export function HomeModeTile(props: HomeModeTileProps) {
  const content = (
    <>
      <span className="mobile-home-mode__icon">{props.icon}</span>
      <span className="mobile-home-mode__label">{props.label}</span>
    </>
  );

  if (props.href) {
    return (
      <a className="mobile-home-mode" href={props.href}>
        {content}
      </a>
    );
  }

  return (
    <button
      className="mobile-home-mode"
      type="button"
      ref={props.buttonRef}
      aria-expanded={props.expanded}
      aria-controls={props.controls}
      onClick={props.onClick}
    >
      {content}
    </button>
  );
}
