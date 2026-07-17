import { useEffect, useMemo, useState } from "react";
import {
  getGuildRecruitCandidate,
  guildRecruitCandidates,
  MAX_GUILD_ROSTER_SIZE,
  type GuildRecruitCandidateDefinition,
} from "../../data/guildRecruitCandidates";
import { items } from "../../data/items";
import { VOCATION_CONFIGS } from "../../data/vocations";
import { getGuildCareer } from "../../game-engine/achievements/getGuildCareer";
import { getGuildRecruitmentAvailability } from "../../game-engine/recruitment/recruitGuildCandidate";
import { SKILL_LABELS } from "../../shared/constants";
import type { Character, Guild, SkillName } from "../../shared/types";

interface GuildRecruitmentBoardProps {
  characters: Character[];
  guild: Guild;
  onRecruit: (candidateId: string) => void;
}

export function GuildRecruitmentBoard({ characters, guild, onRecruit }: GuildRecruitmentBoardProps) {
  const [selectedId, setSelectedId] = useState(guildRecruitCandidates[0].id);
  const selected = getGuildRecruitCandidate(selectedId) ?? guildRecruitCandidates[0];
  const career = useMemo(() => getGuildCareer(guild, characters), [characters, guild]);
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
        <div className="recruitment-crest" aria-hidden="true"><i>R</i><span>{characters.length}/{MAX_GUILD_ROSTER_SIZE}</span></div>
        <div className="recruitment-identity">
          <span>Guild Personnel Office</span>
          <h3>Recruitment Board</h3>
          <p>Review local applicants and offer one permanent place in the roster. Contracts use spendable guild gold and are never repeated.</p>
        </div>
        <div className="recruitment-summary">
          <Summary label="Roster" value={`${characters.length}/${MAX_GUILD_ROSTER_SIZE}`} />
          <Summary label="Career Points" value={career.points.toLocaleString("en-US")} />
          <Summary label="Available" value={availableCount.toString()} />
          <Summary label="Recruited" value={`${recruitedCount}/${guildRecruitCandidates.length}`} />
        </div>
      </section>

      <div className="recruitment-workspace">
        <section className="recruitment-board">
          <header><span>Applicant Register</span><strong>{guildRecruitCandidates.length} local contracts</strong></header>
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

function CandidateCard({ candidate, characters, guild, selected, onSelect }: { candidate: GuildRecruitCandidateDefinition; characters: Character[]; guild: Guild; selected: boolean; onSelect: () => void }) {
  const recruited = isRecruited(candidate, characters);
  const availability = getGuildRecruitmentAvailability(guild, characters, candidate.id);
  const status = recruited ? "Recruited" : availability.available ? "Available" : "Locked";
  return <button aria-pressed={selected} className={`recruitment-card ${recruited ? "is-recruited" : ""}`} onClick={onSelect} type="button"><i>{candidate.sigil}</i><span><small>{candidate.title}</small><strong>{candidate.name}</strong><em>{candidate.vocation} / Level {candidate.level} / {candidate.minimumCareerPoints} CP</em></span><b>{status}</b></button>;
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
