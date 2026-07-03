import type { PropsWithChildren } from "react";

interface GameWindowProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  icon?: string;
  size?: "medium" | "large" | "full";
  onClose?: () => void;
}

export function GameWindow({
  title,
  subtitle,
  icon,
  size = "large",
  onClose,
  children,
}: GameWindowProps) {
  return (
    <section className={`game-window game-window-${size}`}>
      <header className="game-window-header">
        <div className="game-window-title">
          {icon ? <span className="game-window-icon">{icon}</span> : null}
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
        {onClose ? (
          <button aria-label={`Close ${title}`} onClick={onClose} type="button">
            X
          </button>
        ) : null}
      </header>
      <div className="game-window-body">{children}</div>
    </section>
  );
}
