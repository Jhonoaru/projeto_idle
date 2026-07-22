import { useEffect, useMemo, useState } from "react";
import type { GuildDeploymentKind, GuildDeploymentPlannerState } from "../../game-engine/guild-squads/buildGuildDeploymentPlanner";
import type { GuildDeploymentOrderKind, GuildDeploymentOrderSlotId, GuildSquadSlotId } from "../../shared/types";

interface GuildDeploymentPlannerProps {
  planner: GuildDeploymentPlannerState;
  onPrepareBoss: (slotId: GuildSquadSlotId, bossId: string) => void;
  onPrepareContract: (slotId: GuildSquadSlotId, contractId: string) => void;
  selectedOrderSlotId: GuildDeploymentOrderSlotId;
  onAssignOrder: (orderSlotId: GuildDeploymentOrderSlotId, kind: GuildDeploymentOrderKind, targetId: string, squadSlotId: GuildSquadSlotId) => void;
}

export function GuildDeploymentPlanner({ planner, onPrepareBoss, onPrepareContract, selectedOrderSlotId, onAssignOrder }: GuildDeploymentPlannerProps) {
  const [kind, setKind] = useState<GuildDeploymentKind>("boss");
  const targets = kind === "boss" ? planner.bossTargets : planner.contractTargets;
  const [selectedTargetId, setSelectedTargetId] = useState(targets[0]?.id ?? "");
  const selectedTarget = useMemo(
    () => targets.find((target) => target.id === selectedTargetId) ?? targets[0],
    [selectedTargetId, targets],
  );

  useEffect(() => {
    if (!targets.some((target) => target.id === selectedTargetId)) setSelectedTargetId(targets[0]?.id ?? "");
  }, [selectedTargetId, targets]);

  if (!selectedTarget) return null;

  return (
    <section className="guild-deployment-planner">
      <header>
        <div><span>Operation-first planning</span><h4>Deployment Planner</h4></div>
        <strong>{planner.configuredSquadCount} formation{planner.configuredSquadCount === 1 ? "" : "s"} configured</strong>
      </header>
      <div className="guild-deployment-toolbar">
        <div role="group" aria-label="Deployment type">
          <button aria-pressed={kind === "boss"} onClick={() => setKind("boss")} type="button">Boss Raids</button>
          <button aria-pressed={kind === "contract"} onClick={() => setKind("contract")} type="button">Contracts</button>
        </div>
        <label htmlFor="guild-deployment-target">Operation</label>
        <select id="guild-deployment-target" onChange={(event) => setSelectedTargetId(event.target.value)} value={selectedTarget.id}>
          {targets.map((target) => <option key={target.id} value={target.id}>{target.name}</option>)}
        </select>
        <b>{selectedTarget.readySquadCount}/{selectedTarget.candidates.length} ready</b>
      </div>
      <div className="guild-deployment-target">
        <div><span>{selectedTarget.kind === "boss" ? "Raid target" : "Contract posting"}</span><strong>{selectedTarget.name}</strong><small>{selectedTarget.region} / {selectedTarget.detail}</small></div>
        <div><span>Base cost</span><strong>{selectedTarget.cost.toLocaleString("en-US")}g</strong><small>{selectedTarget.recommendedSlotId ? "Ready formation found" : "No formation meets every requirement"}</small></div>
      </div>
      <div className="guild-deployment-candidates">
        {selectedTarget.candidates.map((candidate, index) => {
          const recommended = candidate.slotId === selectedTarget.recommendedSlotId;
          return (
            <article className={`${candidate.ready ? "is-ready" : "is-blocked"} ${!candidate.configured ? "is-empty" : ""}`} key={candidate.slotId}>
              <i>{candidate.sigil}</i>
              <div className="guild-deployment-copy">
                <span>{recommended ? "Recommended formation" : candidate.readinessLabel}</span>
                <strong>{candidate.slotName}</strong>
                <small>{candidate.reason}</small>
              </div>
              <div className="guild-deployment-metrics">
                <span>{candidate.memberCount} deployed</span>
                <strong>{selectedTarget.kind === "boss" ? `${candidate.power.toLocaleString("en-US")} / ${(candidate.targetPower ?? 0).toLocaleString("en-US")}` : `${candidate.chance ?? 0}% chance`}</strong>
                <small>T {candidate.roleCounts.tank} / H {candidate.roleCounts.healer} / D {candidate.roleCounts.damage} / S {candidate.roleCounts.support}</small>
              </div>
              <b>{candidate.ready ? "Ready" : index === 0 && candidate.configured ? "Best available" : "Blocked"}</b>
              <div className="guild-deployment-actions">
                <button disabled={!candidate.unlocked || !candidate.configured} onClick={() => onAssignOrder(selectedOrderSlotId, selectedTarget.kind, selectedTarget.id, candidate.slotId)} type="button">
                  Assign {selectedOrderSlotId === "order-one" ? "I" : selectedOrderSlotId === "order-two" ? "II" : "III"}
                </button>
                <button disabled={!candidate.unlocked || !candidate.configured} onClick={() => selectedTarget.kind === "boss"
                  ? onPrepareBoss(candidate.slotId, selectedTarget.id)
                  : onPrepareContract(candidate.slotId, selectedTarget.id)} type="button">
                  Prepare
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <small className="guild-deployment-note">Recommendations use current availability and operation rules. Preparing only loads the target and formation for review.</small>
    </section>
  );
}
