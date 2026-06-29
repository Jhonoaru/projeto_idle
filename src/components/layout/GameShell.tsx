import type { PropsWithChildren } from "react";

export function GameShell({ children }: PropsWithChildren) {
  return <main className="game-shell">{children}</main>;
}
