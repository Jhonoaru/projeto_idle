import { useEffect, useMemo, useState } from "react";
import { getGuildSquadStatus } from "../../game-engine/guild-squads/getGuildSquadStatus";
import type { Character, Guild, GuildSquadMember, GuildSquadSlotId, PartyRole } from "../../shared/types";

const roles: PartyRole[] = ["tank", "healer", "damage", "support"];

interface GuildSquadsBoardProps {
  guild: Guild;
  characters: Character[];
  onSave: (slotId: GuildSquadSlotId, name: string, members: GuildSquadMember[]) => void;
  onUseForBoss: (slotId: GuildSquadSlotId) => void;
}

export function GuildSquadsBoard({ guild, characters, onSave, onUseForBoss }: GuildSquadsBoardProps) {
  const status = useMemo(() => getGuildSquadStatus(guild, characters), [characters, guild]);
  const [selectedSlotId, setSelectedSlotId] = useState<GuildSquadSlotId>("squad-one");
  const selectedSlot = status.slots.find((slot) => slot.definition.id === selectedSlotId) ?? status.slots[0];
  const [name, setName] = useState(selectedSlot.squad?.name ?? selectedSlot.definition.defaultName);
  const [members, setMembers] = useState<GuildSquadMember[]>(selectedSlot.squad?.members ?? []);

  useEffect(() => {
    if (!selectedSlot.unlocked) {
      setSelectedSlotId(status.slots.find((slot) => slot.unlocked)?.definition.id ?? "squad-one");
    }
  }, [selectedSlot.unlocked, status.slots]);

  useEffect(() => {
    setName(selectedSlot.squad?.name ?? selectedSlot.definition.defaultName);
    setMembers(selectedSlot.squad?.members ?? []);
  }, [selectedSlot.definition.defaultName, selectedSlot.squad]);

  function toggleMember(character: Character) {
    setMembers((current) => {
      if (current.some((member) => member.characterId === character.id)) {
        return current.filter((member) => member.characterId !== character.id);
      }
      if (current.length >= 5) return current;
      return [...current, { characterId: character.id, role: defaultRole(character) }];
    });
  }

  function changeRole(characterId: string, role: PartyRole) {
    setMembers((current) => current.map((member) => member.characterId === characterId ? { ...member, role } : member));
  }

  return (
    <section className="guild-squads-board">
      <header className="ranking-section-heading">
        <div><span>Saved formations</span><h3>Guild Squads</h3></div>
        <strong>{status.configuredCount}/{status.unlockedCount} configured</strong>
      </header>
      <div className="guild-squad-tabs" role="tablist" aria-label="Guild Squad slots">
        {status.slots.map((slot) => (
          <button
            aria-pressed={slot.definition.id === selectedSlot.definition.id}
            disabled={!slot.unlocked}
            key={slot.definition.id}
            onClick={() => setSelectedSlotId(slot.definition.id)}
            type="button"
          >
            <i>{slot.definition.sigil}</i>
            <span><strong>{slot.squad?.name ?? slot.definition.defaultName}</strong><small>{slot.unlocked ? `${slot.squad?.members.length ?? 0}/5 adventurers` : `Guild Level ${slot.definition.minimumGuildLevel}`}</small></span>
          </button>
        ))}
      </div>
      <div className="guild-squad-editor">
        <div className="guild-squad-name">
          <label htmlFor="guild-squad-name">Formation name</label>
          <input id="guild-squad-name" maxLength={24} onChange={(event) => setName(event.target.value)} value={name} />
          <strong>{members.length}/5</strong>
        </div>
        <div className="guild-squad-roster">
          {characters.map((character) => {
            const member = members.find((entry) => entry.characterId === character.id);
            const full = !member && members.length >= 5;
            return (
              <article className={member ? "is-selected" : ""} key={character.id}>
                <button disabled={full} onClick={() => toggleMember(character)} type="button" aria-label={`${member ? "Remove" : "Add"} ${character.name}`}>
                  <i>{character.name.charAt(0)}</i>
                  <span><strong>{character.name}</strong><small>Lv {character.level} {character.vocation} / {character.status}</small></span>
                  <b>{member ? "ON" : "+"}</b>
                </button>
                <select aria-label={`${character.name} squad role`} disabled={!member} onChange={(event) => changeRole(character.id, event.target.value as PartyRole)} value={member?.role ?? defaultRole(character)}>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </article>
            );
          })}
        </div>
        <div className="guild-squad-actions">
          <button onClick={() => onSave(selectedSlot.definition.id, name, members)} type="button">Save Formation</button>
          <button disabled={members.length === 0} onClick={() => onUseForBoss(selectedSlot.definition.id)} type="button">Load in Bosses</button>
          <button disabled={members.length === 0} onClick={() => { setMembers([]); onSave(selectedSlot.definition.id, name, []); }} type="button">Clear</button>
        </div>
      </div>
      <small className="guild-squads-note">Squads are reusable local presets. Saving or loading a formation never starts an activity; current boss, access, cooldown and party rules still apply.</small>
    </section>
  );
}

function defaultRole(character: Character): PartyRole {
  if (character.vocation === "Guardian") return "tank";
  if (character.vocation === "Warden") return "healer";
  if (character.vocation === "Arcanist" || character.vocation === "Ranger") return "damage";
  return "support";
}
