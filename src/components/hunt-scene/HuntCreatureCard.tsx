import { getCreatureVisualMeta } from "../../game-engine/hunt-scene/getCreatureVisualMeta";
import type { HuntSceneCreature } from "./useHuntSceneSimulation";

interface HuntCreatureCardProps {
  creature: HuntSceneCreature;
  active: boolean;
}

export function HuntCreatureCard({ creature, active }: HuntCreatureCardProps) {
  const meta = getCreatureVisualMeta(creature.monster);

  return (
    <article
      className={[
        "hunt-scene-creature",
        `pos-${creature.position}`,
        `tone-${meta.tone}`,
        `is-${creature.state}`,
        active ? "is-active" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="hunt-creature-token">{meta.symbol}</div>
      <div>
        <strong>{creature.monster.name}</strong>
        <span>Lv {creature.monster.level}</span>
      </div>
      <div className="hunt-scene-hpbar">
        <i style={{ width: `${creature.hpPercent}%` }} />
      </div>
    </article>
  );
}
