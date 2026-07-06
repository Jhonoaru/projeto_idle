import type { Character } from "../../shared/types";

interface HuntSceneActorProps {
  character: Character;
  actionText: string;
}

export function HuntSceneActor({ character, actionText }: HuntSceneActorProps) {
  const initials = character.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const weapon = character.equipment.weapon?.item.name ?? character.equipment.offhand?.item.name ?? "Unarmed";

  return (
    <div className={`hunt-scene-character vocation-${character.vocation.toLowerCase()}`}>
      <span>{character.name}</span>
      <div className="hunt-scene-character-core">
        <strong>{initials || "?"}</strong>
      </div>
      <div className="hunt-scene-hpbar">
        <i style={{ width: "86%" }} />
      </div>
      <small>Lv {character.level} {character.vocation} / {weapon}</small>
      <em>{actionText}</em>
    </div>
  );
}
