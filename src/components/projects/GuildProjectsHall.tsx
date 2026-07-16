import { useEffect, useMemo, useState } from "react";
import { getCollectionItemById } from "../../data/collections";
import { getGuildProject, guildProjects } from "../../data/guildProjects";
import { items } from "../../data/items";
import { getGuildCareer } from "../../game-engine/achievements/getGuildCareer";
import { getGuildProjectAvailability } from "../../game-engine/projects/fundGuildProjectPhase";
import { normalizeGuildProjectsState } from "../../game-engine/projects/normalizeGuildProjectsState";
import type { Character, Guild, GuildDepot, GuildProjectDefinition } from "../../shared/types";

interface GuildProjectsHallProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  onFundPhase: (projectId: string) => void;
}

export function GuildProjectsHall({ characters, depot, guild, onFundPhase }: GuildProjectsHallProps) {
  const projects = useMemo(() => normalizeGuildProjectsState(guild.projects), [guild.projects]);
  const career = useMemo(() => getGuildCareer(guild, characters), [characters, guild]);
  const [selectedId, setSelectedId] = useState(guildProjects[0].id);
  const selected = getGuildProject(selectedId) ?? guildProjects[0];
  const progress = projects.progress.find((entry) => entry.projectId === selected.id);
  const completedPhases = progress?.completedPhases ?? 0;
  const availability = getGuildProjectAvailability(guild, depot, characters, selected.id);
  const currentPhase = selected.phases[completedPhases];
  const reward = getCollectionItemById(selected.rewardCollectionItemId);

  useEffect(() => {
    if (!getGuildProject(selectedId)) setSelectedId(guildProjects[0].id);
  }, [selectedId]);

  return (
    <div className="projects-hall">
      <section className="projects-hero">
        <div className="projects-crest" aria-hidden="true"><i>P</i><span>{projects.totalCompleted}/{guildProjects.length}</span></div>
        <div className="projects-identity">
          <span>Guild Works Office</span>
          <h3>Local Projects</h3>
          <p>Fund permanent guild works one phase at a time using spendable gold and unlocked materials held in the Guild Depot.</p>
        </div>
        <div className="projects-summary">
          <Summary label="Completed" value={`${projects.totalCompleted}/${guildProjects.length}`} />
          <Summary label="Career Points" value={career.points.toLocaleString("en-US")} />
          <Summary label="Gold invested" value={`${projects.totalInvestedGold.toLocaleString("en-US")}g`} />
          <Summary label="Materials donated" value={projects.totalDonatedMaterials.toLocaleString("en-US")} />
        </div>
      </section>

      <div className="projects-workspace">
        <section className="projects-board">
          <header><span>Works Register</span><strong>Three permanent commissions</strong></header>
          <div className="projects-card-list">
            {guildProjects.map((project) => <ProjectCard key={project.id} project={project} selected={project.id === selected.id} state={projects} onSelect={() => setSelectedId(project.id)} />)}
          </div>
          <small className="projects-depot-note">Only unlocked, non-quest stacks in the Guild Depot are consumed. Character inventories and the protected Treasury reserve are never touched.</small>
        </section>

        <section className="projects-dossier">
          <header><span>Project Dossier</span><strong>{selected.name}</strong></header>
          <div className="projects-profile">
            <i aria-hidden="true">{selected.sigil}</i>
            <div><span>Permanent guild work</span><h3>{selected.name}</h3><p>{selected.description}</p></div>
          </div>
          <div className="projects-phase-track">
            {selected.phases.map((phase, index) => <div className={index < completedPhases ? "is-complete" : index === completedPhases ? "is-current" : ""} key={phase.name}><i>{index < completedPhases ? "OK" : index + 1}</i><span><strong>{phase.name}</strong><small>{phase.description}</small></span></div>)}
          </div>

          {currentPhase ? (
            <div className="projects-current-phase">
              <div className="projects-phase-heading"><span>Current phase</span><strong>{currentPhase.name}</strong><small>{completedPhases + 1}/{selected.phases.length}</small></div>
              <div className="projects-requirements">
                <Requirement label="Guild gold" value={`${currentPhase.goldCost.toLocaleString("en-US")}g`} ready={guild.gold >= currentPhase.goldCost} />
                {currentPhase.materials.map((requirement) => {
                  const available = countAvailable(depot, requirement.itemId);
                  return <Requirement key={requirement.itemId} label={items[requirement.itemId]?.name ?? requirement.itemId} value={`${available}/${requirement.quantity}`} ready={available >= requirement.quantity} />;
                })}
              </div>
              {availability.reasons.length > 0 ? <div className="projects-blockers">{availability.reasons.map((reason) => <small key={reason}>{reason}</small>)}</div> : null}
              <button className="projects-command" disabled={!availability.available} onClick={() => onFundPhase(selected.id)} type="button">Fund Current Phase</button>
            </div>
          ) : <div className="projects-completed-banner"><i>OK</i><span><strong>Project complete</strong><small>Dedicated {formatDate(progress?.completedAt)}</small></span></div>}

          <div className="projects-reward">
            <span>Completion reward</span>
            <strong>+{selected.rewardRenown} renown / {reward?.name ?? "Local cosmetic"}</strong>
            <small>If the cosmetic is already unlocked, the guild receives +2 renown instead. Projects grant no passive bonuses or income.</small>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProjectCard({ project, selected, state, onSelect }: { project: GuildProjectDefinition; selected: boolean; state: ReturnType<typeof normalizeGuildProjectsState>; onSelect: () => void }) {
  const progress = state.progress.find((entry) => entry.projectId === project.id);
  const phases = progress?.completedPhases ?? 0;
  const prerequisite = getGuildProject(project.prerequisiteProjectId);
  return <button aria-pressed={selected} className={`projects-card ${progress?.completedAt ? "is-complete" : ""}`} onClick={onSelect} type="button"><i>{project.sigil}</i><span><small>{progress?.completedAt ? "Completed" : phases > 0 ? "In progress" : prerequisite ? `After ${prerequisite.name}` : "Available first"}</small><strong>{project.name}</strong><em>{phases}/{project.phases.length} phases / {project.minimumCareerPoints} CP</em></span><b>{progress?.completedAt ? "Built" : `${Math.round((phases / project.phases.length) * 100)}%`}</b></button>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Requirement({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return <div className={ready ? "is-ready" : "is-missing"}><span>{label}</span><strong>{value}</strong></div>;
}

function countAvailable(depot: GuildDepot, itemId: string) {
  return depot.items.filter((item) => item.itemId === itemId && !item.locked && item.item.type !== "quest").reduce((sum, item) => sum + Math.max(0, item.quantity), 0);
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "locally";
}
