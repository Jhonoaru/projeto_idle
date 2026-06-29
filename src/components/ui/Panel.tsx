import type { PropsWithChildren } from "react";

interface PanelProps extends PropsWithChildren {
  title?: string;
  className?: string;
}

export function Panel({ title, className = "", children }: PanelProps) {
  return (
    <section className={`panel ${className}`.trim()}>
      {title ? <h2 className="panel-title">{title}</h2> : null}
      {children}
    </section>
  );
}
