import type { GuildSquadCommandSlot } from "../../game-engine/guild-squads/buildGuildSquadCommandCenter";

interface GuildSquadCommandCenterProps {
  slot: GuildSquadCommandSlot;
  onOpenBosses: (bossId?: string) => void;
  onOpenContracts: () => void;
}

export function GuildSquadCommandCenter({ slot, onOpenBosses, onOpenContracts }: GuildSquadCommandCenterProps) {
  const boss = slot.recommendedBoss;
  const contract = slot.recommendedContract;
  return (
    <section className={`guild-squad-command-center is-${slot.readiness}`}>
      <header>
        <div><span>Formation intelligence</span><h4>Squad Readiness</h4></div>
        <strong>{slot.readinessLabel}</strong>
      </header>
      <div className="guild-squad-command-summary">
        <Summary label="Field power" value={slot.fieldPower.toLocaleString("en-US")} />
        <Summary label="Available" value={`${slot.idleCount}/${slot.aliveCount}`} />
        <Summary label="Boss routes" value={`${slot.readyBossCount}/${slot.bossRoutes.length}`} />
        <Summary label="Contracts" value={`${slot.readyContractCount}/${slot.contractRoutes.length}`} />
      </div>
      <div className="guild-squad-role-line" aria-label="Squad role composition">
        {Object.entries(slot.roleCounts).map(([role, count]) => <div key={role}><span>{role}</span><strong>{count}</strong></div>)}
      </div>
      <div className="guild-squad-route-grid">
        <article>
          <div><span>Raid assessment</span><strong>{boss?.name ?? "No squad configured"}</strong></div>
          <b className={boss?.ready ? "is-ready" : "is-blocked"}>{boss?.ready ? "Ready" : "Blocked"}</b>
          <p>{boss?.reason ?? "Save at least one member to inspect boss routes."}</p>
          {boss ? <small>{boss.power.toLocaleString("en-US")} / {boss.targetPower.toLocaleString("en-US")} power</small> : null}
          <button disabled={!slot.configured} onClick={() => onOpenBosses(boss?.id)} type="button">Prepare Bosses</button>
        </article>
        <article>
          <div><span>Support assessment</span><strong>{contract?.name ?? "No squad configured"}</strong></div>
          <b className={contract?.ready ? "is-ready" : "is-blocked"}>{contract?.ready ? "Ready" : "Blocked"}</b>
          <p>{contract?.reason ?? "Save at least one member to inspect contract routes."}</p>
          {contract ? <small>{contract.teamSize} member(s) / {contract.chance}% projected</small> : null}
          <button disabled={!slot.configured} onClick={onOpenContracts} type="button">Open Contracts</button>
        </article>
      </div>
      <div className="guild-squad-warnings">
        {slot.warnings.map((warning) => <span key={warning}>{warning}</span>)}
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
