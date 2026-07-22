import { useEffect, useMemo, useState } from "react";
import { getGuildSquadStatus } from "../../game-engine/guild-squads/getGuildSquadStatus";
import { buildGuildSquadCommandCenter } from "../../game-engine/guild-squads/buildGuildSquadCommandCenter";
import { buildGuildDeploymentPlanner } from "../../game-engine/guild-squads/buildGuildDeploymentPlanner";
import { buildGuildDeploymentOrders } from "../../game-engine/deployment-orders/buildGuildDeploymentOrders";
import type { Character, Guild, GuildDeploymentOrderKind, GuildDeploymentOrderSlotId, GuildSquadMember, GuildSquadSlotId, PartyRole } from "../../shared/types";
import { GuildSquadCommandCenter } from "./GuildSquadCommandCenter";
import { GuildDeploymentPlanner } from "./GuildDeploymentPlanner";
import { GuildDeploymentOrdersBoard } from "./GuildDeploymentOrdersBoard";

const roles: PartyRole[] = ["tank", "healer", "damage", "support"];

interface GuildSquadsBoardProps {
  guild: Guild;
  characters: Character[];
  onSave: (slotId: GuildSquadSlotId, name: string, members: GuildSquadMember[]) => void;
  onUseForBoss: (slotId: GuildSquadSlotId, bossId?: string) => void;
  onOpenContracts: () => void;
  onPrepareContract: (slotId: GuildSquadSlotId, contractId: string) => void;
  onSaveDeploymentOrder: (orderSlotId: GuildDeploymentOrderSlotId, kind: GuildDeploymentOrderKind, targetId: string, squadSlotId: GuildSquadSlotId) => void;
  onClearDeploymentOrder: (orderSlotId: GuildDeploymentOrderSlotId) => void;
  now: Date;
}

export function GuildSquadsBoard({ guild, characters, onSave, onUseForBoss, onOpenContracts, onPrepareContract, onSaveDeploymentOrder, onClearDeploymentOrder, now }: GuildSquadsBoardProps) {
  const status = useMemo(() => getGuildSquadStatus(guild, characters), [characters, guild]);
  const commandCenter = useMemo(() => buildGuildSquadCommandCenter(guild, characters, now), [characters, guild, now]);
  const deploymentPlanner = useMemo(() => buildGuildDeploymentPlanner(guild, characters, now), [characters, guild, now]);
  const deploymentOrders = useMemo(() => buildGuildDeploymentOrders(guild, characters, now), [characters, guild, now]);
  const [selectedSlotId, setSelectedSlotId] = useState<GuildSquadSlotId>("squad-one");
  const [selectedOrderSlotId, setSelectedOrderSlotId] = useState<GuildDeploymentOrderSlotId>("order-one");
  const selectedSlot = status.slots.find((slot) => slot.definition.id === selectedSlotId) ?? status.slots[0];
  const [name, setName] = useState(selectedSlot.squad?.name ?? selectedSlot.definition.defaultName);
  const [members, setMembers] = useState<GuildSquadMember[]>(selectedSlot.squad?.members ?? []);
  const commandSlot = commandCenter.slots.find((slot) => slot.id === selectedSlot.definition.id) ?? commandCenter.slots[0];

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
      <GuildSquadCommandCenter
        onOpenBosses={(bossId) => onUseForBoss(selectedSlot.definition.id, bossId)}
        onOpenContracts={onOpenContracts}
        slot={commandSlot}
      />
      <GuildDeploymentOrdersBoard
        onClear={onClearDeploymentOrder}
        onPrepareBoss={onUseForBoss}
        onPrepareContract={onPrepareContract}
        onSelectSlot={setSelectedOrderSlotId}
        orders={deploymentOrders}
        selectedSlotId={selectedOrderSlotId}
      />
      <GuildDeploymentPlanner
        onAssignOrder={onSaveDeploymentOrder}
        onPrepareBoss={onUseForBoss}
        onPrepareContract={onPrepareContract}
        planner={deploymentPlanner}
        selectedOrderSlotId={selectedOrderSlotId}
      />
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
