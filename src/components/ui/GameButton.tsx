import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type GameButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function GameButton({ children, className = "", ...props }: GameButtonProps) {
  return (
    <button className={`game-button ${className}`.trim()} type="button" {...props}>
      {children}
    </button>
  );
}
