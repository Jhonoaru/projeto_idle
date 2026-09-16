import { CharacterSprite } from "../characters/CharacterSprite";
import { ItemIcon } from "../items/ItemIcon";
import { CHARACTER_STATUS_LABELS, SKILL_LABELS } from "../../shared/constants";
import type { CharacterDetailsProps } from "./CharacterDetails";
import type { Skill } from "../../shared/types";

export function CharacterAttributes({ character, characters, onSelectCharacter }: CharacterDetailsProps) {
  const attributes = character.attributes;
  const stats = [
    ["Nivel", character.level], ["Experiencia", character.experience],
    ["XP para proximo nivel", character.experienceToNextLevel],
    ["Vida maxima", attributes.maxHealth], ["Mana maxima", attributes.maxMana],
    ["Ataque", attributes.attackPower], ["Defesa", attributes.defensePower],
    ["Armadura", attributes.armor], ["Capacidade", `${character.capacityUsed}/${character.capacityMax}`],
    ["Stamina", `${character.staminaHours}h`],
    ["Chance critica", `${attributes.critChancePercent ?? 0}%`],
    ["Dano critico", `${attributes.critDamagePercent ?? 0}%`],
  ];
  return <div className="character-attributes">
    <header><CharacterSprite character={character} size="large" /><div><h2>{character.name}</h2><p>{character.vocation} · {character.city} · {CHARACTER_STATUS_LABELS[character.status]}</p></div>
      <label>Personagem<select value={character.id} onChange={event => onSelectCharacter(event.target.value)}>{characters.map(entry => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
    </header>
    <div className="character-attributes-columns"><section><h3>Atributos</h3><dl>{stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      <section><h3>Habilidades</h3><dl>{(Object.values(character.skills) as Skill[]).map(skill => <div key={skill.name}><dt>{SKILL_LABELS[skill.name]}</dt><dd>{skill.level} <small>({skill.progressPercent}% do proximo nivel)</small></dd></div>)}</dl></section>
      <section><h3>Equipamento</h3><div className="character-attributes-gear">{Object.entries(character.equipment).filter(([,item]) => item).map(([slot,item]) => <div key={slot}><ItemIcon inventoryItem={item!} size="small" /><span>{item!.item.name}<small>{slot}</small></span></div>)}</div></section></div>
  </div>;
}
