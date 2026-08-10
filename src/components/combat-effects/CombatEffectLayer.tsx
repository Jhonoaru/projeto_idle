import type { CSSProperties } from "react";
import { getCombatEffectProfile } from "../../data/combatEffectProfiles";
import type { Character, PartyRole } from "../../shared/types";

export interface CombatEffectActor {
  character: Character;
  role?: PartyRole;
}

interface CombatEffectLayerProps {
  actors: CombatEffectActor[];
  mode: "hunt" | "boss";
  resolved: boolean;
  target: { x: number; y: number };
}

const bossOrigins = [
  { x: 31, y: 53 },
  { x: 22, y: 40 },
  { x: 22, y: 68 },
  { x: 39, y: 40 },
  { x: 39, y: 68 },
];

export function CombatEffectLayer({ actors, mode, resolved, target }: CombatEffectLayerProps) {
  const layerStyle = {
    "--effect-target-x": `${target.x}%`,
    "--effect-target-y": `${target.y}%`,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={`combat-effect-layer combat-effect-${mode} ${resolved ? "is-resolved" : "is-active"}`}
      style={layerStyle}
    >
      {actors.slice(0, 5).map((actor, index) => {
        const profile = getCombatEffectProfile(actor.character.vocation);
        const origin = mode === "hunt" ? { x: 50, y: 50 } : bossOrigins[index] ?? bossOrigins[0];
        const angle = Math.atan2(target.y - origin.y, target.x - origin.x) * (180 / Math.PI);
        const style = {
          "--effect-accent": profile.accent,
          "--effect-secondary": profile.secondary,
          "--effect-origin-x": `${origin.x}%`,
          "--effect-origin-y": `${origin.y}%`,
          "--effect-target-x": `${target.x}%`,
          "--effect-target-y": `${target.y}%`,
          "--effect-angle": `${angle}deg`,
          "--effect-delay": `${index * -0.27}s`,
        } as CSSProperties;

        return (
          <span
            className={`combat-effect-sequence effect-${profile.kind} role-${actor.role ?? "solo"}`}
            key={actor.character.id}
            style={style}
          >
            <i className="combat-effect-caster" />
            <i className="combat-effect-projectile"><b /></i>
            <i className="combat-effect-impact"><b /><b /><b /></i>
          </span>
        );
      })}
      <span className="combat-effect-resolve"><i /><i /><i /></span>
    </div>
  );
}
