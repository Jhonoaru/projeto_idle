import type { CSSProperties } from "react";
import { buildCombatFloatingFeedback, type CombatFloatingFeedbackActor } from "../../game-engine/combat-feedback/buildCombatFloatingFeedback";

interface CombatFloatingFeedbackProps {
  actors: CombatFloatingFeedbackActor[];
  elapsedMs: number;
  mode: "hunt" | "boss";
  resolved: boolean;
  target: { x: number; y: number };
}

export function CombatFloatingFeedback(props: CombatFloatingFeedbackProps) {
  const events = buildCombatFloatingFeedback(props);

  return (
    <div aria-hidden="true" className={`combat-floating-feedback mode-${props.mode}`} data-feedback-count={events.length}>
      {events.map((event) => {
        const style = {
          "--feedback-delay": `${event.delayMs}ms`,
          "--feedback-x": `${event.x}%`,
          "--feedback-y": `${event.y}%`,
        } as CSSProperties;
        return (
          <span className={`combat-floating-number is-${event.kind}`} data-feedback-kind={event.kind} key={event.id} style={style}>
            {event.kind === "healing" ? "+" : "-"}{event.value.toLocaleString("en-US")}
            {event.kind === "critical" ? <small>CRIT</small> : null}
          </span>
        );
      })}
    </div>
  );
}
