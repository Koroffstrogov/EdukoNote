type SettingsButtonProps = {
  href?: string;
  label?: string;
};

export function SettingsButton({ href = "/settings", label = "Paramètres" }: SettingsButtonProps) {
  return (
    <a className="settings-button" href={href} aria-label={label}>
      <svg className="settings-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Zm0-5.4 1.58.38.48 2.05c.39.14.76.3 1.11.52l1.8-1.11 1.28 1.02.18 2.11c.27.31.51.65.72 1.01l2.08.33.7 1.47-.96 1.88c.03.21.04.43.04.65s-.01.44-.04.65l.96 1.88-.7 1.47-2.08.33c-.21.36-.45.7-.72 1.01l-.18 2.11-1.28 1.02-1.8-1.11c-.35.21-.72.38-1.11.52L13.58 22 12 22.38 10.42 22l-.48-2.05a7.29 7.29 0 0 1-1.11-.52l-1.8 1.11-1.28-1.02-.18-2.11a7.37 7.37 0 0 1-.72-1.01l-2.08-.33-.7-1.47.96-1.88A5.7 5.7 0 0 1 3 12c0-.22.01-.44.04-.65l-.96-1.88.7-1.47 2.08-.33c.21-.36.45-.7.72-1.01l.18-2.11 1.28-1.02 1.8 1.11c.35-.21.72-.38 1.11-.52L10.42 3 12 2.62Z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}
