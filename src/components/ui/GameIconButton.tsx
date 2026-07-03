import type { ButtonHTMLAttributes } from "react";

interface GameIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: string;
  active?: boolean;
  badge?: string;
}

export function GameIconButton({
  label,
  icon,
  active,
  badge,
  className = "",
  ...buttonProps
}: GameIconButtonProps) {
  return (
    <button
      className={`game-icon-button ${active ? "is-active" : ""} ${className}`.trim()}
      title={label}
      type="button"
      {...buttonProps}
    >
      <span aria-hidden="true">{icon}</span>
      <strong>{label}</strong>
      {badge ? <em>{badge}</em> : null}
    </button>
  );
}
