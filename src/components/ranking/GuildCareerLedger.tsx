import { useMemo, useState } from "react";
import {
  formatAchievementCategory,
  formatAchievementMetric,
  getGuildCareer,
} from "../../game-engine/achievements/getGuildCareer";
import type { Character, Guild, GuildAchievementCategory } from "../../shared/types";

interface GuildCareerLedgerProps {
  characters: Character[];
  guild: Guild;
}

type CareerFilter = GuildAchievementCategory | "all";

export function GuildCareerLedger({ characters, guild }: GuildCareerLedgerProps) {
  const career = useMemo(() => getGuildCareer(guild, characters), [characters, guild]);
  const [activeFilter, setActiveFilter] = useState<CareerFilter>("all");
  const [selectedAchievementId, setSelectedAchievementId] = useState(
    career.achievements.find((entry) => !entry.unlocked)?.definition.id
      ?? career.achievements[0]?.definition.id
      ?? "",
  );
  const filteredAchievements = activeFilter === "all"
    ? career.achievements
    : career.achievements.filter((entry) => entry.definition.category === activeFilter);
  const selectedAchievement = filteredAchievements.find(
    (entry) => entry.definition.id === selectedAchievementId,
  ) ?? filteredAchievements[0];

  return (
    <div className="career-ledger">
      <section className="career-command-strip">
        <div className="career-rank-sigil" aria-hidden="true">{getRankSigil(career.rank.title)}</div>
        <div className="career-command-copy">
          <span>Guild career rank</span>
          <h3>{career.rank.title}</h3>
          <p>Permanent milestones calculated from the current guild save.</p>
        </div>
        <div className="career-rank-progress">
          <div><span>Career points</span><strong>{career.points}/{career.maxPoints}</strong></div>
          <i><b style={{ width: `${career.rankProgressPercent}%` }} /></i>
          <small>
            {career.nextRank
              ? `${career.nextRank.minimumPoints - career.points} points to ${career.nextRank.title}`
              : "Highest career rank recorded"}
          </small>
        </div>
        <div className="career-command-status">
          <span>Recorded</span>
          <strong>{career.unlockedCount}/{career.totalCount}</strong>
          <small>No claim required</small>
        </div>
      </section>

      <nav className="career-category-tabs" aria-label="Career achievement categories">
        <button
          aria-pressed={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
          type="button"
        >
          <span>ALL</span><strong>All Records</strong><small>{career.unlockedCount}/{career.totalCount}</small>
        </button>
        {career.categorySummaries.map((summary) => (
          <button
            aria-pressed={activeFilter === summary.category}
            key={summary.category}
            onClick={() => setActiveFilter(summary.category)}
            type="button"
          >
            <span>{getCategorySigil(summary.category)}</span>
            <strong>{formatAchievementCategory(summary.category)}</strong>
            <small>{summary.unlockedCount}/{summary.totalCount}</small>
          </button>
        ))}
      </nav>

      <div className="career-workspace">
        <section className="career-record-board">
          <header className="ranking-section-heading">
            <div>
              <span>Career archive</span>
              <h3>{activeFilter === "all" ? "All Guild Milestones" : formatAchievementCategory(activeFilter)}</h3>
            </div>
            <strong>{filteredAchievements.length} permanent records</strong>
          </header>
          <div className="career-record-grid">
            {filteredAchievements.map((entry) => (
              <button
                aria-pressed={selectedAchievement?.definition.id === entry.definition.id}
                className={`career-record-card is-${entry.definition.tier} ${entry.unlocked ? "is-unlocked" : "is-locked"}`}
                key={entry.definition.id}
                onClick={() => setSelectedAchievementId(entry.definition.id)}
                type="button"
              >
                <i>{entry.definition.sigil}</i>
                <span className="career-record-copy">
                  <small>{entry.definition.tier} / {formatAchievementCategory(entry.definition.category)}</small>
                  <strong>{entry.definition.title}</strong>
                  <em>{entry.definition.description}</em>
                </span>
                <span className="career-record-progress">
                  <i><b style={{ width: `${entry.progressPercent}%` }} /></i>
                  <small>{formatAchievementMetric(entry.definition.metric, entry.current)} / {formatAchievementMetric(entry.definition.metric, entry.definition.target)}</small>
                </span>
                <span className="career-record-points">{entry.definition.points} pts</span>
                <span className="career-record-state">{entry.unlocked ? "Recorded" : `${entry.progressPercent}%`}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="career-record-dossier">
          {selectedAchievement ? (
            <>
              <header className="ranking-section-heading">
                <div><span>Selected milestone</span><h3>{selectedAchievement.definition.title}</h3></div>
                <strong>{selectedAchievement.definition.points} career points</strong>
              </header>
              <div className={`career-dossier-sigil is-${selectedAchievement.definition.tier}`}>
                <i>{selectedAchievement.definition.sigil}</i>
                <div>
                  <span>{selectedAchievement.definition.tier} record</span>
                  <strong>{selectedAchievement.unlocked ? "Recorded" : "In progress"}</strong>
                  <small>{formatAchievementCategory(selectedAchievement.definition.category)}</small>
                </div>
              </div>
              <p className="career-dossier-description">{selectedAchievement.definition.description}</p>
              <div className="career-dossier-progress">
                <div><span>Current progress</span><strong>{selectedAchievement.progressPercent}%</strong></div>
                <i><b style={{ width: `${selectedAchievement.progressPercent}%` }} /></i>
                <div>
                  <strong>{formatAchievementMetric(selectedAchievement.definition.metric, selectedAchievement.current)}</strong>
                  <small>of {formatAchievementMetric(selectedAchievement.definition.metric, selectedAchievement.definition.target)}</small>
                </div>
              </div>
              <div className="career-dossier-note">
                <span>Automatic record</span>
                <p>This milestone is derived from permanent save data. Career points are a local record and cannot be spent.</p>
              </div>
            </>
          ) : <div className="ranking-empty">No career record is available.</div>}
        </aside>
      </div>
    </div>
  );
}

function getCategorySigil(category: GuildAchievementCategory) {
  const sigils: Record<GuildAchievementCategory, string> = {
    growth: "GR",
    contracts: "QT",
    hunting: "HN",
    mastery: "MS",
    collections: "CL",
    legacy: "LG",
  };
  return sigils[category];
}

function getRankSigil(title: string) {
  return title.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
