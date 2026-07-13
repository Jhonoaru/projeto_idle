import { useMemo, useState } from "react";
import { getMainSkill } from "../../game-engine/character/getMainSkill";
import type { Character, Guild, Skill } from "../../shared/types";

interface LocalRankingHallProps {
  characters: Character[];
  guild: Guild;
  selectedCharacter: Character;
  onSelectCharacter: (characterId: string) => void;
}

type RankingMetric = "experience" | "level" | "power" | "skills";

interface MetricDefinition {
  label: string;
  shortLabel: string;
  description: string;
  getValue: (character: Character) => number;
  format: (value: number) => string;
}

const metricDefinitions: Record<RankingMetric, MetricDefinition> = {
  experience: {
    label: "Experience",
    shortLabel: "XP",
    description: "Permanent experience earned by each guild adventurer.",
    getValue: (character) => character.experience,
    format: (value) => `${value.toLocaleString("en-US")} XP`,
  },
  level: {
    label: "Character Level",
    shortLabel: "LV",
    description: "Current character level, with experience used to break ties.",
    getValue: (character) => character.level,
    format: (value) => `Level ${value}`,
  },
  power: {
    label: "Combat Power",
    shortLabel: "CP",
    description: "Local score from attack, defense, armor, health and mana.",
    getValue: getCombatPower,
    format: (value) => `${value.toLocaleString("en-US")} power`,
  },
  skills: {
    label: "Skill Total",
    shortLabel: "SK",
    description: "Sum of all seven permanent combat skill levels.",
    getValue: getSkillTotal,
    format: (value) => `${value.toLocaleString("en-US")} levels`,
  },
};

const metrics = Object.keys(metricDefinitions) as RankingMetric[];

export function LocalRankingHall({
  characters,
  guild,
  selectedCharacter,
  onSelectCharacter,
}: LocalRankingHallProps) {
  const [activeMetric, setActiveMetric] = useState<RankingMetric>("experience");
  const definition = metricDefinitions[activeMetric];
  const ranked = useMemo(
    () => rankCharacters(characters, activeMetric),
    [activeMetric, characters],
  );
  const leader = ranked[0];
  const selectedRank = ranked.findIndex((character) => character.id === selectedCharacter.id) + 1;
  const averageLevel = characters.length
    ? Math.round(characters.reduce((total, character) => total + character.level, 0) / characters.length)
    : 0;
  const totalExperience = characters.reduce((total, character) => total + character.experience, 0);

  return (
    <div className="ranking-hall">
      <section className="ranking-hall-hero">
        <div className="ranking-hall-seal" aria-hidden="true">
          <i />
          <span>R</span>
        </div>
        <div className="ranking-hall-identity">
          <span>Local guild chronicle</span>
          <h3>{guild.name} Hall of Renown</h3>
          <p>Offline standings calculated from the adventurers in this save.</p>
        </div>
        <div className="ranking-hall-summary">
          <SummaryStat label="Adventurers" value={`${characters.length}`} />
          <SummaryStat label="Average level" value={`${averageLevel}`} />
          <SummaryStat label="Combined XP" value={compactNumber(totalExperience)} />
          <SummaryStat label="Your position" value={selectedRank > 0 ? `#${selectedRank}` : "Unranked"} />
        </div>
      </section>

      <nav className="ranking-metric-tabs" aria-label="Ranking metric">
        {metrics.map((metric) => {
          const metricDefinition = metricDefinitions[metric];
          return (
            <button
              className={activeMetric === metric ? "is-active" : ""}
              key={metric}
              onClick={() => setActiveMetric(metric)}
              type="button"
            >
              <span>{metricDefinition.shortLabel}</span>
              <strong>{metricDefinition.label}</strong>
              <small>{metricDefinition.description}</small>
            </button>
          );
        })}
      </nav>

      <section className="ranking-podium-board">
        <header className="ranking-section-heading">
          <div>
            <span>Guild podium</span>
            <h3>{definition.label} Leaders</h3>
          </div>
          <strong>{definition.description}</strong>
        </header>

        {ranked.length > 0 ? (
          <div className={`ranking-podium has-${Math.min(3, ranked.length)}`}>
            {ranked.slice(0, 3).map((character, index) => (
              <PodiumEntry
                character={character}
                definition={definition}
                key={character.id}
                onSelect={onSelectCharacter}
                rank={index + 1}
                selected={character.id === selectedCharacter.id}
              />
            ))}
          </div>
        ) : (
          <div className="ranking-empty">No adventurers available for the local ranking.</div>
        )}
      </section>

      <div className="ranking-hall-lower">
        <section className="ranking-standings-board">
          <header className="ranking-section-heading">
            <div>
              <span>Complete standings</span>
              <h3>Guild Classification</h3>
            </div>
            <strong>Local save / {characters.length} entries</strong>
          </header>

          <div className="ranking-table" role="table" aria-label={`${definition.label} standings`}>
            <div className="ranking-table-header" role="row">
              <span>Rank</span>
              <span>Adventurer</span>
              <span>Vocation</span>
              <span>Level</span>
              <span>Main skill</span>
              <span>{definition.shortLabel}</span>
            </div>
            {ranked.map((character, index) => {
              const mainSkill = getMainSkill(character);
              const selected = character.id === selectedCharacter.id;
              return (
                <button
                  className={`ranking-table-row ${selected ? "is-selected" : ""}`}
                  key={character.id}
                  onClick={() => onSelectCharacter(character.id)}
                  role="row"
                  type="button"
                >
                  <span className="ranking-table-position">#{index + 1}</span>
                  <span className="ranking-table-character">
                    <i>{getInitials(character.name)}</i>
                    <span><strong>{character.name}</strong><small>{character.city} / {formatStatus(character.status)}</small></span>
                  </span>
                  <span>{character.vocation}</span>
                  <strong>Lv {character.level}</strong>
                  <span>{formatSkill(mainSkill)}</span>
                  <strong>{definition.format(definition.getValue(character))}</strong>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="ranking-record-dossier">
          <header className="ranking-section-heading">
            <div>
              <span>Selected record</span>
              <h3>{selectedCharacter.name}</h3>
            </div>
            <strong>Rank #{selectedRank || "-"}</strong>
          </header>

          <div className="ranking-record-portrait">
            <i>{getInitials(selectedCharacter.name)}</i>
            <div>
              <span>{selectedCharacter.vocation}</span>
              <h4>{selectedCharacter.name}</h4>
              <p>{selectedCharacter.city} / {formatStatus(selectedCharacter.status)}</p>
            </div>
          </div>

          <div className="ranking-record-score">
            <span>{definition.label}</span>
            <strong>{definition.format(definition.getValue(selectedCharacter))}</strong>
            <div><i style={{ width: `${getRelativeScore(selectedCharacter, leader, definition)}%` }} /></div>
            <small>{leader?.id === selectedCharacter.id ? "Current guild leader" : `${getRelativeScore(selectedCharacter, leader, definition)}% of leader score`}</small>
          </div>

          <div className="ranking-record-stats">
            <SummaryStat label="Experience" value={compactNumber(selectedCharacter.experience)} />
            <SummaryStat label="Combat power" value={`${getCombatPower(selectedCharacter)}`} />
            <SummaryStat label="Skill total" value={`${getSkillTotal(selectedCharacter)}`} />
            <SummaryStat label="Completed quests" value={`${selectedCharacter.completedQuestIds.length}`} />
          </div>

          <div className="ranking-local-notice">
            <span>Offline record</span>
            <p>This hall compares only characters stored in the current guild save. No online leaderboard is connected.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PodiumEntry({
  character,
  definition,
  rank,
  selected,
  onSelect,
}: {
  character: Character;
  definition: MetricDefinition;
  rank: number;
  selected: boolean;
  onSelect: (characterId: string) => void;
}) {
  const mainSkill = getMainSkill(character);
  return (
    <button
      className={`ranking-podium-entry rank-${rank} ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(character.id)}
      type="button"
    >
      <span className="ranking-podium-rank">{rank}</span>
      <i className="ranking-podium-avatar">{getInitials(character.name)}</i>
      <small>{character.vocation}</small>
      <h4>{character.name}</h4>
      <strong>{definition.format(definition.getValue(character))}</strong>
      <em>Level {character.level} / {formatSkill(mainSkill)}</em>
      <span className="ranking-podium-base">#{rank} Guild Rank</span>
    </button>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function rankCharacters(characters: Character[], metric: RankingMetric) {
  const definition = metricDefinitions[metric];
  return [...characters].sort((first, second) =>
    definition.getValue(second) - definition.getValue(first)
    || second.experience - first.experience
    || second.level - first.level
    || first.name.localeCompare(second.name),
  );
}

function getCombatPower(character: Character) {
  const { attackPower, defensePower, armor, maxHealth, maxMana } = character.attributes;
  return Math.round(attackPower + defensePower + armor * 4 + maxHealth / 10 + maxMana / 12);
}

function getSkillTotal(character: Character) {
  return (Object.values(character.skills) as Skill[]).reduce((total, skill) => total + skill.level, 0);
}

function getRelativeScore(character: Character, leader: Character | undefined, definition: MetricDefinition) {
  if (!leader) return 0;
  const leaderValue = Math.max(1, definition.getValue(leader));
  return Math.max(0, Math.min(100, Math.round((definition.getValue(character) / leaderValue) * 100)));
}

function formatSkill(skill: Skill) {
  return `${skill.name.charAt(0).toUpperCase()}${skill.name.slice(1)} ${skill.level}`;
}

function formatStatus(status: Character["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function compactNumber(value: number) {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}
