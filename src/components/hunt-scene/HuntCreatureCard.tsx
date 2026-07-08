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
        <span>
          {creature.state === "spawning"
            ? `Nasce em ${creature.spawnSeconds}s`
            : `Lv ${creature.monster.level}`}
        </span>
      </div>
      {creature.state === "spawning" ? (
        <div className="hunt-scene-spawnbar">
          <i style={{ width: `${Math.round(creature.spawnProgress * 100)}%` }} />
        </div>
      ) : null}
      <div className="hunt-scene-hpbar">
        <i style={{ width: `${creature.hpPercent}%` }} />
      </div>
    </article>
  );
}
