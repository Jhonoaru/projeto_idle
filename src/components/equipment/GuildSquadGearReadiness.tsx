import { useEffect, useMemo, useState } from "react";
import {
  buildGuildSquadGearReadiness,
  type GuildSquadGearReadinessSlot,
} from "../../game-engine/loadout-templates/buildGuildSquadGearReadiness";
import type { Character, Guild, GuildDepot, GuildSquadSlotId } from "../../shared/types";

interface GuildSquadGearReadinessProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  onOpenOperations: () => void;
  onOpenProcurement: (characterId: string) => void;
  onOpenTemplates: (characterId: string) => void;
}

export function GuildSquadGearReadiness({
  characters,
  depot,
  guild,
  onOpenOperations,
  onOpenProcurement,
  onOpenTemplates,
}: GuildSquadGearReadinessProps) {
  const readiness = useMemo(
    () => buildGuildSquadGearReadiness(guild, characters, depot),
    [characters, depot, guild],
  );
  const firstConfigured = readiness.slots.find((slot) => slot.configured && slot.unlocked);
  const [selectedSlotId, setSelectedSlotId] = useState<GuildSquadSlotId>(
    firstConfigured?.id ?? "squad-one",
  );
  const selected = readiness.slots.find((slot) => slot.id === selectedSlotId)
    ?? readiness.slots[0];

  useEffect(() => {
    if (selected?.unlocked && selected.configured) return;
    const fallback = readiness.slots.find((slot) => slot.unlocked && slot.configured)
      ?? readiness.slots.find((slot) => slot.unlocked)
      ?? readiness.slots[0];
    if (fallback && fallback.id !== selectedSlotId) setSelectedSlotId(fallback.id);
  }, [readiness.slots, selected, selectedSlotId]);

  return (
    <section className="squad-gear-readiness">
      <div className="squad-gear-summary">
        <Summary label="Formations" value={`${readiness.summary.configuredSquads}/${readiness.summary.unlockedSquads}`} />
        <Summary label="Gear ready" value={String(readiness.summary.readySquads)} />
        <Summary label="Members planned" value={`${readiness.summary.plannedMembers}/${readiness.summary.members}`} />
        <Summary label="Targets equipped" value={`${readiness.summary.equipped}/${readiness.summary.targets}`} />
        <Summary label="Overall readiness" value={`${readiness.summary.completionPercent}%`} />
      </div>

      <div className="squad-gear-tabs" role="tablist" aria-label="Squad gear readiness slots">
        {readiness.slots.map((slot) => (
          <button
            aria-controls={selected?.id === slot.id ? `squad-gear-panel-${slot.id}` : undefined}
            aria-selected={selected?.id === slot.id}
            className={`is-${slot.status}`}
            disabled={!slot.unlocked}
            id={`squad-gear-tab-${slot.id}`}
            key={slot.id}
            onClick={() => setSelectedSlotId(slot.id)}
            role="tab"
            type="button"
          >
            <i>{slot.sigil}</i>
            <span><strong>{slot.name}</strong><small>{slot.statusLabel}</small></span>
            <b>{slot.summary.readyMembers}/{slot.summary.memberCount}</b>
          </button>
        ))}
      </div>

      {selected ? (
        <div
          aria-labelledby={`squad-gear-tab-${selected.id}`}
          id={`squad-gear-panel-${selected.id}`}
          role="tabpanel"
        >
          <SquadDossier
            onOpenOperations={onOpenOperations}
            onOpenProcurement={onOpenProcurement}
            onOpenTemplates={onOpenTemplates}
            slot={selected}
          />
        </div>
      ) : null}

      <small className="squad-gear-note">
        Readiness is derived from saved squads, active loadout targets and currently equipped gear.
        This board never equips items or starts an operation.
      </small>
    </section>
  );
}

interface SquadDossierProps {
  slot: GuildSquadGearReadinessSlot;
  onOpenOperations: () => void;
  onOpenProcurement: (characterId: string) => void;
  onOpenTemplates: (characterId: string) => void;
}

function SquadDossier({
  slot,
  onOpenOperations,
  onOpenProcurement,
  onOpenTemplates,
}: SquadDossierProps) {
  if (!slot.unlocked) {
    return (
      <div className="squad-gear-empty">
        <strong>Formation slot locked</strong>
        <span>Reach Guild Level {slot.minimumGuildLevel} to unlock this company.</span>
      </div>
    );
  }
  if (!slot.configured) {
    return (
      <div className="squad-gear-empty">
        <strong>No adventurers assigned</strong>
        <span>Configure this reusable formation before coordinating its equipment plans.</span>
        <button onClick={onOpenOperations} type="button">Open Guild Squads</button>
      </div>
    );
  }

  return (
    <div className="squad-gear-dossier">
      <header>
        <div>
          <span>Formation equipment command</span>
          <strong>{slot.name}</strong>
          <small>{slot.summary.equippedTargets}/{slot.summary.assignedTargets} targets equipped</small>
        </div>
        <b className={`is-${slot.status}`}>{slot.statusLabel}</b>
      </header>
      <div className="squad-gear-progress">
        <span style={{ width: `${slot.summary.completionPercent}%` }} />
        <b>{slot.summary.completionPercent}%</b>
      </div>

      <section className="squad-gear-orders">
        <header><span>Linked deployment orders</span><button onClick={onOpenOperations} type="button">Open Guild Squads</button></header>
        {slot.linkedOrders.length > 0 ? (
          <div>
            {slot.linkedOrders.map((order) => (
              <span key={order.id}><i>{order.kind === "boss" ? "B" : "C"}</i><strong>{order.targetName}</strong><small>{order.kind}</small></span>
            ))}
          </div>
        ) : <p>No deployment order currently uses this formation.</p>}
      </section>

      <div className="squad-gear-members">
        {slot.members.map((member) => (
          <article className={`is-${member.status}`} key={member.character.id}>
            <i>{member.character.name.charAt(0)}</i>
            <span>
              <small>{member.roleLabel} / Level {member.character.level} {member.character.vocation}</small>
              <strong>{member.character.name}</strong>
              <em>{member.templateName ?? "No active loadout"} / {member.nextAction}</em>
            </span>
            <div>
              <b>{member.equippedTargets}/{member.assignedTargets}</b>
              <small>{member.statusLabel}</small>
            </div>
            <button
              onClick={() => {
                if (member.status === "incomplete") {
                  onOpenProcurement(member.character.id);
                } else {
                  onOpenTemplates(member.character.id);
                }
              }}
              type="button"
            >
              {member.status === "ready"
                ? "Inspect"
                : member.status === "incomplete"
                  ? "Open Procurement"
                  : "Plan Loadout"}
            </button>
          </article>
        ))}
      </div>

      {slot.warnings.length > 0 ? (
        <aside className="squad-gear-warnings">
          {slot.warnings.map((warning) => <span key={warning}>{warning}</span>)}
        </aside>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
