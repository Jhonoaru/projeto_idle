import { useMemo } from "react";
import {
  buildOperationReadinessBriefing,
  type OperationReadinessBriefingSlot,
} from "../../game-engine/operations/buildOperationReadinessBriefing";
import type {
  Character,
  Guild,
  GuildDeploymentOrderSlotId,
  GuildDepot,
  GuildSquadSlotId,
} from "../../shared/types";

interface OperationReadinessBriefingProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  now: Date;
  selectedSlotId: GuildDeploymentOrderSlotId;
  onOpenArmory: () => void;
  onPrepareBoss: (squadSlotId: GuildSquadSlotId, bossId?: string) => void;
  onPrepareContract: (squadSlotId: GuildSquadSlotId, contractId: string) => void;
  onSelectOrder: (slotId: GuildDeploymentOrderSlotId) => void;
  onSelectSquad: (slotId: GuildSquadSlotId) => void;
}

export function OperationReadinessBriefing({
  characters,
  depot,
  guild,
  now,
  selectedSlotId,
  onOpenArmory,
  onPrepareBoss,
  onPrepareContract,
  onSelectOrder,
  onSelectSquad,
}: OperationReadinessBriefingProps) {
  const briefing = useMemo(
    () => buildOperationReadinessBriefing(guild, characters, depot, now),
    [characters, depot, guild, now],
  );
  const selected = briefing.slots.find((slot) => slot.id === selectedSlotId) ?? briefing.slots[0];

  return (
    <section className="operation-readiness-briefing">
      <header>
        <div><span>Pre-deployment review</span><h4>Operation Readiness Briefing</h4></div>
        <div className="operation-briefing-summary">
          <Summary label="Orders" value={`${briefing.summary.configured}/3`} />
          <Summary label="Operational" value={String(briefing.summary.operationReady)} />
          <Summary label="Fully ready" value={String(briefing.summary.fullyReady)} />
          <Summary label="Gear review" value={String(briefing.summary.gearPending)} />
        </div>
      </header>

      <div className="operation-briefing-tabs" role="tablist" aria-label="Operation readiness orders">
        {briefing.slots.map((slot) => (
          <button
            aria-controls={selected.id === slot.id ? `operation-briefing-panel-${slot.id}` : undefined}
            aria-selected={selected.id === slot.id}
            className={`is-${slot.status}`}
            id={`operation-briefing-tab-${slot.id}`}
            key={slot.id}
            onClick={() => onSelectOrder(slot.id)}
            role="tab"
            type="button"
          >
            <i>{slot.sigil}</i>
            <span><strong>{slot.target?.name ?? slot.name}</strong><small>{slot.statusLabel}</small></span>
            <b>{slot.order ? slot.order.kind === "boss" ? "B" : "C" : "+"}</b>
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`operation-briefing-tab-${selected.id}`}
        id={`operation-briefing-panel-${selected.id}`}
        role="tabpanel"
      >
        <BriefingDossier
          onOpenArmory={onOpenArmory}
          onPrepareBoss={onPrepareBoss}
          onPrepareContract={onPrepareContract}
          onSelectSquad={onSelectSquad}
          slot={selected}
        />
      </div>

      <small className="operation-briefing-note">
        This review is derived from the current save. Preparing opens the existing Boss or Contract flow and never dispatches automatically.
      </small>
    </section>
  );
}

interface BriefingDossierProps {
  slot: OperationReadinessBriefingSlot;
  onOpenArmory: () => void;
  onPrepareBoss: (squadSlotId: GuildSquadSlotId, bossId?: string) => void;
  onPrepareContract: (squadSlotId: GuildSquadSlotId, contractId: string) => void;
  onSelectSquad: (slotId: GuildSquadSlotId) => void;
}

function BriefingDossier({
  slot,
  onOpenArmory,
  onPrepareBoss,
  onPrepareContract,
  onSelectSquad,
}: BriefingDossierProps) {
  if (!slot.order || !slot.target || !slot.candidate) {
    return (
      <div className="operation-briefing-empty">
        <i>{slot.sigil}</i>
        <span><strong>No operation assigned</strong><small>Use the Deployment Planner below to bind a target and formation to this order.</small></span>
      </div>
    );
  }

  return (
    <div className={`operation-briefing-dossier is-${slot.status}`}>
      <div className="operation-briefing-target">
        <i>{slot.order.kind === "boss" ? "B" : "C"}</i>
        <span>
          <small>{slot.order.kind} / {slot.target.region}</small>
          <strong>{slot.target.name}</strong>
          <em>{slot.target.detail}</em>
        </span>
        <div><small>Formation</small><strong>{slot.candidate.slotName}</strong><em>{slot.candidate.memberCount} assigned / {slot.candidate.availableCount} available</em></div>
        <b>{slot.statusLabel}</b>
      </div>

      <div className="operation-briefing-checks">
        {slot.checks.map((check) => (
          <article className={`is-${check.status}`} key={check.label}>
            <i>{check.status === "pass" ? "+" : check.status === "fail" ? "!" : "~"}</i>
            <span><strong>{check.label}</strong><small>{check.detail}</small></span>
          </article>
        ))}
      </div>

      <div className="operation-briefing-footer">
        <div>
          <span>Field power <strong>{slot.candidate.power.toLocaleString("en-US")}</strong></span>
          {slot.candidate.targetPower !== undefined ? <span>Target <strong>{slot.candidate.targetPower.toLocaleString("en-US")}</strong></span> : null}
          {slot.candidate.chance !== undefined ? <span>Success <strong>{slot.candidate.chance}%</strong></span> : null}
          <span>Gear <strong>{slot.gear?.summary.completionPercent ?? 0}%</strong></span>
        </div>
        <div>
          <button onClick={() => onSelectSquad(slot.order!.squadSlotId)} type="button">Review Formation</button>
          {slot.status === "gear-pending" || slot.gear?.status === "invalid" || slot.gear?.status === "unplanned"
            ? <button onClick={onOpenArmory} type="button">Open Guild Armory</button>
            : null}
          <button
            disabled={!slot.candidate.ready}
            onClick={() => slot.order?.kind === "boss"
              ? onPrepareBoss(slot.order.squadSlotId, slot.order.targetId)
              : onPrepareContract(slot.order!.squadSlotId, slot.order!.targetId)}
            type="button"
          >
            Prepare Operation
          </button>
        </div>
      </div>

      {slot.blockers.length > 0 ? (
        <aside>{slot.blockers.map((blocker) => <span key={blocker}>{blocker}</span>)}</aside>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
