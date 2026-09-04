import type { CSSProperties } from "react";
import { getHuntMotionVector, type HuntActorMotionPhase } from "../../game-engine/hunt-scene/getHuntMotionState";
import type { Character } from "../../shared/types";
import { CharacterSprite } from "../characters/CharacterSprite";

interface HuntSceneActorProps {
  character: Character;
  actionText: string;
  motionPhase: HuntActorMotionPhase;
  targetPosition?: string;
}

export function HuntSceneActor({ character, actionText, motionPhase, targetPosition }: HuntSceneActorProps) {
  const weapon = character.equipment.weapon?.item.name ?? character.equipment.offhand?.item.name ?? "Unarmed";
  const vector = getHuntMotionVector(targetPosition, "actor");
  const motionStyle = {
    "--hunt-motion-x": `${vector.x * 13}px`,
    "--hunt-motion-y": `${vector.y * 10}px`,
    "--hunt-recoil-x": `${vector.x * -5}px`,
    "--hunt-recoil-y": `${vector.y * -4}px`,
  } as CSSProperties;

  return (
    <div
      className={`hunt-scene-character vocation-${character.vocation.toLowerCase()} motion-${motionPhase}`}
      data-motion-phase={motionPhase}
      style={motionStyle}
    >
      <span>{character.name}</span>
      <CharacterSprite character={character} className="hunt-scene-character-core" size="scene" />
      <div className="hunt-scene-hpbar">
        <i style={{ width: "86%" }} />
      </div>
      <small>Lv {character.level} {character.vocation} / {weapon}</small>
      <em>{actionText}</em>
    </div>
  );
}
