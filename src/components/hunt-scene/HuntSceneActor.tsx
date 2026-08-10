import type { Character } from "../../shared/types";
import { CharacterSprite } from "../characters/CharacterSprite";

interface HuntSceneActorProps {
  character: Character;
  actionText: string;
}

export function HuntSceneActor({ character, actionText }: HuntSceneActorProps) {
  const weapon = character.equipment.weapon?.item.name ?? character.equipment.offhand?.item.name ?? "Unarmed";

  return (
    <div className={`hunt-scene-character vocation-${character.vocation.toLowerCase()}`}>
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
