import { useEffect, useMemo, useState } from "react";
import {
  getGuildRecruitCandidate,
  guildRecruitCandidates,
  type GuildRecruitCandidateDefinition,
} from "../../data/guildRecruitCandidates";
import { guildProgressionMilestones } from "../../data/guildProgression";
import { items } from "../../data/items";
import { VOCATION_CONFIGS } from "../../data/vocations";
import { getGuildCareer } from "../../game-engine/achievements/getGuildCareer";
import { getGuildRecruitmentAvailability } from "../../game-engine/recruitment/recruitGuildCandidate";
import { getGuildProgression } from "../../game-engine/guild-progression/getGuildProgression";
import { getGuildLevelRewardStatus } from "../../game-engine/guild-progression/getGuildLevelRewardStatus";
import { getGuildRenownObjectiveStatus } from "../../game-engine/guild-progression/getGuildRenownObjectiveStatus";
import type { GuildRenownObjectiveDefinition } from "../../data/guildRenownObjectives";
import { SKILL_LABELS } from "../../shared/constants";
import type { Character, Guild, SkillName } from "../../shared/types";

interface GuildRecruitmentBoardProps {
  characters: Character[];
  guild: Guild;
  onRecruit: (candidateId: string) => void;
  onClaimLevelReward: (level: number) => void;
  onClaimRenownObjective: (objectiveId: string) => void;
  onOpenSystem: (destination: GuildRenownObjectiveDefinition["destination"]) => void;
}

export function GuildRecruitmentBoard({ characters, guild, onRecruit, onClaimLevelReward, onClaimRenownObjective, onOpenSystem }: GuildRecruitmentBoardProps) {
  const [selectedId, setSelectedId] = useState(guildRecruitCandidates[0].id);
  const selected = getGuildRecruitCandidate(selectedId) ?? guildRecruitCandidates[0];
  const career = useMemo(() => getGuildCareer(guild, characters), [characters, guild]);
  const progression = useMemo(() => getGuildProgression(guild), [guild]);
  const rewardStatus = useMemo(() => getGuildLevelRewardStatus(guild), [guild]);
  const objectiveStatus = useMemo(() => getGuildRenownObjectiveStatus(guild, characters), [characters, guild]);
  const recruitedCount = guildRecruitCandidates.filter((candidate) => isRecruited(candidate, characters)).length;
  const availableCount = guildRecruitCandidates.filter((candidate) => getGuildRecruitmentAvailability(guild, characters, candidate.id).available).length;
  const availability = getGuildRecruitmentAvailability(guild, characters, selected.id);
  const recruited = isRecruited(selected, characters);

  useEffect(() => {
    if (!getGuildRecruitCandidate(selectedId)) setSelectedId(guildRecruitCandidates[0].id);
  }, [selectedId]);

  return (
    <div className="recruitment-hall">
      <section className="recruitment-hero">
        <div className="recruitment-crest" aria-hidden="true"><i>{progression.rank}</i><span>{characters.length}/{progression.rosterCapacity}</span></div>
        <div className="recruitment-identity">
          <span>Guild Personnel Office</span>
          <h3>Recruitment Board</h3>
          <p>Renown raises the guild level, expands roster capacity and unlocks permanent local applicants without online rotations.</p>
        </div>
        <div className="recruitment-summary">
          <Summary label="Roster" value={`${characters.length}/${progression.rosterCapacity}`} />
          <Summary label="Guild Level" value={`${progression.level}/${progression.maxLevel}`} />
          <Summary label="Renown" value={progression.renown.toLocaleString("en-US")} />
          <Summary label="Renown Orders" value={`${objectiveStatus.claimedCount}/${objectiveStatus.objectives.length}`} />
        </div>
      </section>

      <section className="recruitment-standing">
        <header>
          <div><span>Guild standing</span><h3>Rank {progression.rank} / {progression.title}</h3></div>
          <strong>{progression.next ? `${progression.renownToNext} renown to Level ${progression.next.level}` : "Maximum standing reached"} / {career.points.toLocaleString("en-US")} CP / {objectiveStatus.claimableCount + rewardStatus.claimableCount} claim{objectiveStatus.claimableCount + rewardStatus.claimableCount === 1 ? "" : "s"} ready</strong>
        </header>
        <div className="recruitment-renown-track" aria-label={`${progression.progressPercent}% guild level progress`}>
          <i style={{ width: `${progression.progressPercent}%` }} />
        </div>
        <div className="recruitment-milestones">
          {guildProgressionMilestones.map((milestone) => {
            const candidate = getGuildRecruitCandidate(milestone.candidateId);
            const reached = progression.level >= milestone.level;
            return (
              <article className={`${reached ? "is-reached" : ""} ${progression.level === milestone.level ? "is-current" : ""}`.trim()} key={milestone.level}>
                <i>{milestone.rank}</i>
                <span><small>Level {milestone.level} / {milestone.requiredRenown} renown</small><strong>{milestone.title}</strong><em>Roster {milestone.rosterCapacity} / {candidate?.name ?? "Contract"}</em></span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="guild-renown-objectives-board">
        <header>
          <div><span>Local progression orders</span><h3>Guild Renown Objectives</h3></div>
          <strong>{objectiveStatus.claimedCount}/{objectiveStatus.objectives.length} claimed / {objectiveStatus.totalRenownAvailable} total renown</strong>
        </header>
        <div className="guild-renown-objective-grid">
          {objectiveStatus.objectives.map(({ definition, current, progressPercent, claimed, claimable }) => (
            <article className={`${claimed ? "is-claimed" : ""} ${claimable ? "is-claimable" : ""}`.trim()} key={definition.id}>
              <div className="guild-renown-objective-heading">
                <i>{definition.sigil}</i>
                <span><small>{formatObjectiveSource(definition.destination)}</small><strong>{definition.title}</strong></span>
                <b>+{definition.rewardRenown}</b>
              </div>
              <p>{definition.description}</p>
              <div className="guild-renown-objective-progress">
                <span><i style={{ width: `${progressPercent}%` }} /></span>
                <strong>{Math.min(current, definition.target)}/{definition.target}</strong>
              </div>
              {claimable ? (
                <button onClick={() => onClaimRenownObjective(definition.id)} type="button">Claim Renown</button>
              ) : claimed ? (
                <button disabled type="button">Claimed</button>
              ) : definition.destination === "recruitment" ? (
                <button disabled type="button">Applicants Below</button>
              ) : (
                <button onClick={() => onOpenSystem(definition.destination)} type="button">Open Source</button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="guild-level-reward-board">
        <header>
          <div><span>Milestone rewards</span><h3>Guild Charter Caches</h3></div>
          <strong>{rewardStatus.claimedCount}/{rewardStatus.rewards.length} claimed</strong>
        </header>
        <div className="guild-level-reward-grid">
          {rewardStatus.rewards.map(({ reward, reached, claimed, claimable }) => (
            <article className={`${claimed ? "is-claimed" : ""} ${claimable ? "is-claimable" : ""}`.trim()} key={reward.level}>
              <i>{reward.level}</i>
              <div><small>Guild Level {reward.level}</small><strong>{reward.label}</strong><p>{reward.preview}</p></div>
              <button disabled={!claimable} onClick={() => onClaimLevelReward(reward.level)} type="button">
                {claimed ? "Claimed" : reached ? "Claim Reward" : "Locked"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="recruitment-workspace">
        <section className="recruitment-board">
          <header><span>Applicant Register</span><strong>{availableCount} available / {recruitedCount}/{guildRecruitCandidates.length} recruited</strong></header>
          <div className="recruitment-card-list">
            {guildRecruitCandidates.map((candidate) => (
              <CandidateCard
                candidate={candidate}
                characters={characters}
                guild={guild}
                key={candidate.id}
                onSelect={() => setSelectedId(candidate.id)}
                selected={candidate.id === selected.id}
              />
            ))}
          </div>
          <small className="recruitment-note">Applicants are permanent local characters with fixed contracts, equipment and progression.</small>
        </section>

        <section className="recruitment-dossier">
          <header><span>Applicant Dossier</span><strong>{selected.name}</strong></header>
          <div className="recruitment-profile">
            <i aria-hidden="true">{selected.sigil}</i>
            <div><span>{selected.title}</span><h3>{selected.name}</h3><p>{selected.description}</p></div>
            <b>{selected.vocation}<small>Level {selected.level}</small></b>
          </div>

          <div className="recruitment-facts">
            <Fact label="Home city" value={selected.city} />
            <Fact label="Field role" value={VOCATION_CONFIGS[selected.vocation].role} />
            <Fact label="Contract" value={`${selected.hireCost.toLocaleString("en-US")}g`} />
            <Fact label="Guild requirement" value={`Level ${selected.minimumGuildLevel}`} />
            <Fact label="Career requirement" value={`${selected.minimumCareerPoints} CP`} />
          </div>

          <div className="recruitment-detail-grid">
            <div className="recruitment-loadout">
              <span>Starter loadout</span>
              {Object.entries(selected.equipment).map(([slot, itemId]) => (
                <div key={slot}><small>{slot}</small><strong>{items[itemId]?.name ?? itemId}</strong></div>
              ))}
              {selected.inventory.map((entry) => (
                <div key={entry.itemId}><small>pack</small><strong>{items[entry.itemId]?.name ?? entry.itemId} x{entry.quantity}</strong></div>
              ))}
            </div>
            <div className="recruitment-skills">
              <span>Starting disciplines</span>
              {getLeadingSkills(selected).map(([skill, level]) => (
                <div key={skill}><small>{SKILL_LABELS[skill]}</small><strong>{level}</strong><i style={{ width: `${Math.min(100, level * 3)}%` }} /></div>
              ))}
            </div>
          </div>

          <div className="recruitment-contract">
            <div><span>Permanent contract</span><strong>{selected.hireCost.toLocaleString("en-US")}g</strong><small>Paid from spendable guild gold</small></div>
            {availability.reasons.length > 0 ? <div className="recruitment-blockers">{availability.reasons.map((reason) => <small key={reason}>{reason}</small>)}</div> : null}
            <button disabled={!availability.available} onClick={() => onRecruit(selected.id)} type="button">
              {recruited ? "Already Recruited" : "Recruit Adventurer"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatObjectiveSource(destination: GuildRenownObjectiveDefinition["destination"]) {
  const labels: Record<GuildRenownObjectiveDefinition["destination"], string> = {
    quests: "Quest Board",
    bestiary: "Bestiary",
    contracts: "Contracts Board",
    headquarters: "Guild Headquarters",
    projects: "Guild Projects",
    recruitment: "Applicant Register",
  };
  return labels[destination];
}

function CandidateCard({ candidate, characters, guild, selected, onSelect }: { candidate: GuildRecruitCandidateDefinition; characters: Character[]; guild: Guild; selected: boolean; onSelect: () => void }) {
  const recruited = isRecruited(candidate, characters);
  const availability = getGuildRecruitmentAvailability(guild, characters, candidate.id);
  const status = recruited ? "Recruited" : availability.available ? "Available" : "Locked";
  return <button aria-pressed={selected} className={`recruitment-card ${recruited ? "is-recruited" : ""}`} onClick={onSelect} type="button"><i>{candidate.sigil}</i><span><small>{candidate.title}</small><strong>{candidate.name}</strong><em>{candidate.vocation} / Lv {candidate.level} / Guild {candidate.minimumGuildLevel} / {candidate.minimumCareerPoints} CP</em></span><b>{status}</b></button>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function isRecruited(candidate: GuildRecruitCandidateDefinition, characters: Character[]) {
  return characters.some((character) => character.id === candidate.characterId);
}

function getLeadingSkills(candidate: GuildRecruitCandidateDefinition) {
  return (Object.entries(candidate.skills) as Array<[SkillName, number]>).sort((left, right) => right[1] - left[1]).slice(0, 4);
}
