import { useEffect, useMemo, useState } from "react";
import type { MainPanelTab } from "../layout/MainPanel";
import type { ActivityLogEntry, Character, Guild, GuildDepot, GuildSquadMember, GuildSquadSlotId } from "../../shared/types";
import {
  buildCampaignOperationsDashboard,
  type CampaignOperationTone,
} from "../../game-engine/operations/buildCampaignOperationsDashboard";
import { GuildSquadsBoard } from "./GuildSquadsBoard";

interface CampaignOperationsDashboardProps {
  guild: Guild;
  depot: GuildDepot;
  characters: Character[];
  logs: ActivityLogEntry[];
  onOpenSystem: (tab: MainPanelTab) => void;
  onSelectCharacter: (characterId: string) => void;
  onSaveGuildSquad: (slotId: GuildSquadSlotId, name: string, members: GuildSquadMember[]) => void;
  onUseGuildSquadForBoss: (slotId: GuildSquadSlotId) => void;
}

export function CampaignOperationsDashboard({
  guild,
  depot,
  characters,
  logs,
  onOpenSystem,
  onSelectCharacter,
  onSaveGuildSquad,
  onUseGuildSquadForBoss,
}: CampaignOperationsDashboardProps) {
  const [clock, setClock] = useState(() => Date.now());
  const dashboard = useMemo(
    () => buildCampaignOperationsDashboard(guild, depot, characters, new Date(clock)),
    [characters, clock, depot, guild],
  );

  useEffect(() => {
    const hasTimer = dashboard.roster.some((entry) => entry.tone === "active" && entry.remainingMs > 0)
      || (dashboard.expedition.status === "active" && dashboard.expedition.remainingMs > 0);
    if (!hasTimer) return undefined;
    const interval = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [dashboard.expedition.remainingMs, dashboard.expedition.status, dashboard.roster]);

  function openRosterOperation(characterId: string, destination: "action" | "hunts") {
    onSelectCharacter(characterId);
    onOpenSystem(destination);
  }

  return (
    <div className="operations-dashboard">
      <section className="operations-hero">
        <div className="operations-seal" aria-hidden="true"><i>O</i><span>{dashboard.summary.readyReports}</span></div>
        <div className="operations-identity">
          <span>Guild command office</span>
          <h3>{guild.name} Operations</h3>
          <p>One local overview for adventurer assignments, support expeditions and the current campaign focus.</p>
        </div>
        <div className="operations-summary">
          <Summary label="Available" value={`${dashboard.summary.idleAdventurers} adventurers`} tone="idle" />
          <Summary label="In the field" value={`${dashboard.summary.activeAdventurers} active`} tone="active" />
          <Summary label="Reports ready" value={String(dashboard.summary.readyReports)} tone={dashboard.summary.readyReports > 0 ? "ready" : "idle"} />
          <Summary label="Campaign focus" value={`${dashboard.summary.pinnedPriorities}/3 priorities`} tone={dashboard.summary.unreadLogisticsAlerts > 0 ? "ready" : "idle"} />
        </div>
      </section>

      <GuildSquadsBoard
        characters={characters}
        guild={guild}
        onSave={onSaveGuildSquad}
        onUseForBoss={onUseGuildSquadForBoss}
      />

      <div className="operations-primary-grid">
        <section className="operations-roster">
          <SectionHeading eyebrow="Field assignments" title="Adventurer Roster" value={`${dashboard.roster.length} registered`} />
          <div className="operations-roster-list">
            {dashboard.roster.map((entry) => (
              <article className={`is-${entry.tone}`} key={entry.characterId}>
                <i aria-hidden="true">{entry.name.charAt(0)}</i>
                <div className="operations-roster-copy">
                  <span>Lv {entry.level} {entry.vocation} / {entry.city}</span>
                  <strong>{entry.name}</strong>
                  <small>{entry.label}{entry.target ? ` / ${entry.target}` : ""}</small>
                  {entry.tone === "active" || entry.tone === "ready" ? <progress max={100} value={entry.progressPercent} /> : null}
                </div>
                <div className="operations-roster-status">
                  <b>{rosterStatusLabel(entry.status)}</b>
                  <small>{entry.tone === "active" ? entry.remainingMs > 0 ? formatRemaining(entry.remainingMs) : "Timer unavailable" : entry.tone === "ready" ? "Report waiting" : entry.tone === "blocked" ? "Unavailable" : "Standing by"}</small>
                  <button onClick={() => openRosterOperation(entry.characterId, entry.destination)} type="button">
                    {entry.destination === "hunts" ? "Assign" : entry.tone === "blocked" ? "Recover" : "Review"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="operations-queue">
          <SectionHeading eyebrow="Command review" title="Next Orders" value={`${dashboard.recommendations.length} listed`} />
          <div className="operations-recommendations">
            {dashboard.recommendations.length > 0 ? dashboard.recommendations.map((entry, index) => (
              <article className={`is-${entry.tone}`} key={entry.id}>
                <i>{index + 1}</i>
                <div><strong>{entry.title}</strong><small>{entry.description}</small></div>
                <button onClick={() => onOpenSystem(entry.destination as MainPanelTab)} type="button">Open</button>
              </article>
            )) : <p>There are no urgent campaign orders. The guild is standing by.</p>}
          </div>
          <div className="operations-command-strip">
            <button onClick={() => onOpenSystem("logistics")} type="button">Logistics</button>
            <button onClick={() => onOpenSystem("contracts")} type="button">Contracts</button>
            <button onClick={() => onOpenSystem("projects")} type="button">Projects</button>
          </div>
        </aside>
      </div>

      <div className="operations-secondary-grid">
        <section className={`operations-expedition is-${dashboard.expedition.tone}`}>
          <SectionHeading eyebrow="Support operation" title="Guild Expedition" value={expeditionStatusLabel(dashboard.expedition.status)} />
          <div className="operations-expedition-body">
            <i aria-hidden="true">C</i>
            <div>
              <span>{dashboard.expedition.region ?? "Contracts Board"}</span>
              <strong>{dashboard.expedition.contractName}</strong>
              <small>{dashboard.expedition.teamNames.length > 0 ? dashboard.expedition.teamNames.join(" / ") : `${dashboard.summary.availableContracts} contract(s) currently fundable`}</small>
              {dashboard.expedition.status !== "idle" ? <progress max={100} value={dashboard.expedition.progressPercent} /> : null}
            </div>
            <div>
              <strong>{dashboard.expedition.status === "active" ? formatRemaining(dashboard.expedition.remainingMs) : dashboard.expedition.status === "ready" ? "Report ready" : "No dispatch"}</strong>
              <small>{dashboard.expedition.successChance ? `${dashboard.expedition.successChance}% fixed chance` : "Manual dispatch only"}</small>
              <button onClick={() => onOpenSystem("contracts")} type="button">Open Contracts</button>
            </div>
          </div>
        </section>

        <section className="operations-focus">
          <SectionHeading eyebrow="Permanent campaign" title="Priority Focus" value={`${dashboard.summary.missingPriorityMaterials} materials missing`} />
          <div className="operations-priority-list">
            {dashboard.priorities.length > 0 ? dashboard.priorities.map((entry, index) => (
              <article className={`is-${entry.status}`} key={entry.id}>
                <i>{index + 1}</i>
                <div><span>{entry.category} / {entry.targetLabel}</span><strong>{entry.title}</strong><small>{entry.requiredMaterials > 0 ? `${entry.coveredMaterials}/${entry.requiredMaterials} materials` : "Gold-only objective"}</small></div>
                <b>{priorityStatusLabel(entry.status)}</b>
                <button onClick={() => onOpenSystem(entry.destination as MainPanelTab)} type="button">Open</button>
              </article>
            )) : (
              <div className="operations-empty-focus">
                <strong>No campaign priorities pinned</strong>
                <span>Use Logistics to choose up to three permanent objectives.</span>
                <button onClick={() => onOpenSystem("logistics")} type="button">Open Logistics</button>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="operations-ledger">
        <SectionHeading eyebrow="Local campaign record" title="Recent Activity" value={`${logs.length} entries`} />
        {logs.length > 0 ? (
          <div>{logs.slice(0, 6).map((entry) => (
            <article key={entry.id}><i>{logSigil(entry.tone)}</i><span><strong>{entry.title}</strong><small>{entry.message}</small></span><time>{entry.timestamp}</time></article>
          ))}</div>
        ) : <p>No campaign activity recorded yet.</p>}
      </section>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone: CampaignOperationTone }) {
  return <div className={`is-${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function SectionHeading({ eyebrow, title, value }: { eyebrow: string; title: string; value: string }) {
  return <header className="operations-section-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div><strong>{value}</strong></header>;
}

function rosterStatusLabel(status: string) {
  if (status === "ready") return "Ready";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function expeditionStatusLabel(status: "idle" | "active" | "ready") {
  if (status === "ready") return "Report ready";
  if (status === "active") return "Underway";
  return "Standing by";
}

function priorityStatusLabel(status: string) {
  if (status === "ready") return "Ready";
  if (status === "materials") return "Need materials";
  if (status === "gold") return "Need gold";
  return "Locked";
}

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function logSigil(tone: ActivityLogEntry["tone"]) {
  if (tone === "success") return "+";
  if (tone === "warning") return "!";
  return "-";
}
