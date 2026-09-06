import type { CSSProperties } from "react";
import { getCreatureVisualMeta } from "../../game-engine/hunt-scene/getCreatureVisualMeta";
import { getHuntMotionVector } from "../../game-engine/hunt-scene/getHuntMotionState";
import { CreatureSprite } from "../creatures/CreatureSprite";
import type { HuntSceneCreature } from "./useHuntSceneSimulation";

interface HuntCreatureCardProps {
  creature: HuntSceneCreature;
  active: boolean;
}

export function HuntCreatureCard({ creature, active }: HuntCreatureCardProps) {
  const meta = getCreatureVisualMeta(creature.monster);
  const vector = getHuntMotionVector(creature.position);
  const motionStyle = {
    "--hunt-motion-x": `${vector.x * 11}px`,
    "--hunt-motion-y": `${vector.y * 8}px`,
    "--hunt-recoil-x": `${vector.x * -6}px`,
    "--hunt-recoil-y": `${vector.y * -5}px`,
  } as CSSProperties;

  return (
    <article
      className={[
        "hunt-scene-creature",
        `pos-${creature.position}`,
        `tone-${meta.tone}`,
        `is-${creature.state}`,
        `motion-${creature.motionPhase}`,
        active ? "is-active" : "",
      ].filter(Boolean).join(" ")}
      data-motion-phase={creature.motionPhase}
      data-combat-target={active && creature.state !== "defeated" && creature.state !== "spawning" ? "active" : undefined}
      style={motionStyle}
    >
      <CreatureSprite
        className="hunt-creature-token"
        fallbackSymbol={meta.symbol}
        monster={creature.monster}
        size="small"
      />
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
