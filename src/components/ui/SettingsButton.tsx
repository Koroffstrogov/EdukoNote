type SettingsButtonProps = {
  href?: string;
  label?: string;
};

export function SettingsButton({ href = "/settings", label = "Paramètres" }: SettingsButtonProps) {
  return (
    <a className="settings-button" href={href} aria-label={label}>
      <svg className="settings-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect
            key={angle}
            x="10.85"
            y="1.85"
            width="2.3"
            height="4.35"
            rx="1.15"
            fill="currentColor"
            transform={`rotate(${angle} 12 12)`}
          />
        ))}
        <path
          d="M12 5.75a6.25 6.25 0 1 1 0 12.5 6.25 6.25 0 0 1 0-12.5Zm0 4a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    </a>
  );
}
