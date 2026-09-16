import { useEffect, useState } from "react";
import { CharacterSprite } from "../characters/CharacterSprite";
import { getActionCompletionStatus } from "../../game-engine/offline/getActionCompletionStatus";
import { formatDuration } from "../../shared/time";
import type { Character, Guild } from "../../shared/types";
import type { MainPanelTab } from "./MainPanel";
import "./guild-central.css";

const groups: { title: string; links: [MainPanelTab, string][] }[] = [
  { title: "Jogar", links: [["hunts", "Explorar"], ["action", "Atividade atual"], ["daily", "Recompensa diaria"]] },
  { title: "Equipamentos e recursos", links: [["inventory", "Inventario"], ["market", "NPC e Bazar"], ["depot", "Deposito"], ["forge", "Forja"], ["imbuing", "Imbuements"]] },
  { title: "Administrar a guilda", links: [["recruitment", "Recrutamento"], ["headquarters", "Sede e melhorias"], ["treasury", "Tesouraria"], ["operations", "Operacoes"], ["logistics", "Logistica"]] },
];
const advanced: [MainPanelTab, string][] = [["skills", "Skills"], ["blessings", "Blessings"], ["destiny", "Destiny"], ["focus", "Monster Focus"], ["bestiary", "Bestiary"], ["proficiency", "Proficiencia"], ["collections", "Collections"], ["store", "Visuais"], ["ranking", "Ranking local"], ["staff", "Equipe da sede"], ["projects", "Projetos"], ["contracts", "Contratos"], ["armory", "Arsenal"], ["atlas", "Atlas"]];

export function GuildCentral({ guild, characters, selectedCharacter, onSelectCharacter, onOpenTab }: {
  guild: Guild; characters: Character[]; selectedCharacter: Character;
  onSelectCharacter: (id: string) => void; onOpenTab: (tab: MainPanelTab) => void;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const active = characters.filter(character => character.status !== "idle");
  return <div className="guild-central">
    <header className="central-heading"><div><span>GUILD HUNT IDLE</span><h2>Central da Guilda</h2><p>{guild.name} · Nivel {guild.level}</p></div><button className="central-explore" onClick={() => onOpenTab("hunts")}>Explorar</button></header>
    <div className="central-columns">
      <section className="central-roster"><h3>Personagens <small>{characters.length}</small></h3>
        <div className="central-roster-list">{characters.map(character => <button key={character.id} className={character.id === selectedCharacter.id ? "is-selected" : ""} aria-pressed={character.id === selectedCharacter.id} onClick={() => onSelectCharacter(character.id)}>
          <CharacterSprite character={character} size="medium" /><span><strong>{character.name}</strong><small>{character.vocation} · Lv {character.level}</small></span><small>{character.status === "idle" ? "Disponivel" : character.status === "dead" ? "No templo" : "Em atividade"}</small>
        </button>)}</div>
        <button className="central-details" onClick={() => onOpenTab("character")}>Atributos de {selectedCharacter.name}</button>
      </section>
      <section className="central-work"><h3>Atividades <small>{active.length}</small></h3>
        {active.length === 0 ? <p className="central-empty">Nenhuma atividade em andamento.</p> : <div className="central-activities">{active.map(character => {
          const status = getActionCompletionStatus(character, now);
          const ready = status === "ready_to_resolve" || status === "completed_offline";
          const end = Date.parse(character.currentAction?.endsAt ?? "");
          return <div key={character.id}><span><strong>{character.name}</strong><small>{character.currentAction?.targetName ?? character.city}</small></span><span>{ready ? "Pronto para coletar" : Number.isFinite(end) ? formatDuration(end - now.getTime()) : character.status === "dead" ? "Recuperacao" : "Em andamento"}</span><button onClick={() => { onSelectCharacter(character.id); onOpenTab("action"); }}>{ready ? "Coletar resultado" : "Ver atividade"}</button>{character.status === "hunting" || character.status === "bossing" ? <button onClick={() => { onSelectCharacter(character.id); onOpenTab("home"); }}>Combate</button> : null}</div>;
        })}</div>}
        <section className="central-selected-character"><CharacterSprite character={selectedCharacter} size="large" /><div><h3>{selectedCharacter.name}</h3><p>{selectedCharacter.vocation} · Nivel {selectedCharacter.level}</p><p>{selectedCharacter.city}</p><dl><dt>Ataque</dt><dd>{selectedCharacter.attributes.attackPower}</dd><dt>Defesa</dt><dd>{selectedCharacter.attributes.defensePower}</dd><dt>Vida</dt><dd>{selectedCharacter.attributes.maxHealth}</dd><dt>Mana</dt><dd>{selectedCharacter.attributes.maxMana}</dd></dl></div></section>
      </section>
    </div>
  </div>;
}
