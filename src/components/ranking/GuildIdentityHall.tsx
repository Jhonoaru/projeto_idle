import { useMemo, useState } from "react";
import { formatAchievementCategory } from "../../game-engine/achievements/getGuildCareer";
import { getGuildIdentity } from "../../game-engine/achievements/getGuildIdentity";
import type { Character, Guild } from "../../shared/types";

interface GuildIdentityHallProps {
  characters: Character[];
  guild: Guild;
  onEquipTitle: (titleId: string | null) => void;
}

type TitleFilter = "all" | "unlocked" | "locked";

export function GuildIdentityHall({ characters, guild, onEquipTitle }: GuildIdentityHallProps) {
  const identity = useMemo(() => getGuildIdentity(guild, characters), [characters, guild]);
  const [filter, setFilter] = useState<TitleFilter>("all");
  const [selectedTitleId, setSelectedTitleId] = useState(
    identity.activeTitle?.definition.id
      ?? identity.titles.find((entry) => entry.unlocked)?.definition.id
      ?? identity.titles[0]?.definition.id
      ?? "",
  );
  const visibleTitles = identity.titles.filter((entry) => (
    filter === "all" || (filter === "unlocked" ? entry.unlocked : !entry.unlocked)
  ));
  const selectedTitle = visibleTitles.find((entry) => entry.definition.id === selectedTitleId)
    ?? visibleTitles[0];
  const activeTitle = identity.activeTitle?.definition;

  return (
    <div className="guild-identity-hall">
      <section className="guild-banner-preview">
        <div className="guild-banner-mark" aria-hidden="true">
          <i />
          <strong>{activeTitle?.sigil ?? getGuildInitials(guild.name)}</strong>
          <i />
        </div>
        <div className="guild-banner-copy">
          <span>Equipped guild identity</span>
          <h3>{guild.name}</h3>
          <strong>{activeTitle?.title ?? "No title equipped"}</strong>
          <p>{activeTitle?.description ?? "Select an unlocked career title to carry it across the client."}</p>
        </div>
        <div className="guild-banner-record">
          <div><span>Career rank</span><strong>{identity.career.rank.title}</strong></div>
          <div><span>Titles unlocked</span><strong>{identity.unlockedCount}/{identity.totalCount}</strong></div>
          <div><span>Career points</span><strong>{identity.career.points}</strong></div>
        </div>
      </section>

      <nav className="guild-title-filters" aria-label="Guild title availability">
        <FilterButton active={filter === "all"} label="All Titles" onClick={() => setFilter("all")} value={identity.totalCount} />
        <FilterButton active={filter === "unlocked"} label="Available" onClick={() => setFilter("unlocked")} value={identity.unlockedCount} />
        <FilterButton active={filter === "locked"} label="Locked" onClick={() => setFilter("locked")} value={identity.totalCount - identity.unlockedCount} />
      </nav>

      <div className="guild-identity-workspace">
        <section className="guild-title-catalog">
          <header className="ranking-section-heading">
            <div><span>Banner archive</span><h3>Guild Titles</h3></div>
            <strong>{visibleTitles.length} identities</strong>
          </header>
          <div className="guild-title-grid">
            {visibleTitles.map((entry) => {
              const equipped = activeTitle?.id === entry.definition.id;
              return (
                <button
                  aria-pressed={selectedTitle?.definition.id === entry.definition.id}
                  className={`guild-title-card ${entry.unlocked ? "is-unlocked" : "is-locked"} ${equipped ? "is-equipped" : ""}`}
                  key={entry.definition.id}
                  onClick={() => setSelectedTitleId(entry.definition.id)}
                  type="button"
                >
                  <i>{entry.definition.sigil}</i>
                  <span>
                    <small>{formatAchievementCategory(entry.definition.category)}</small>
                    <strong>{entry.definition.title}</strong>
                    <em>{entry.requirementLabel}</em>
                  </span>
                  <b>{equipped ? "Equipped" : entry.unlocked ? "Available" : "Locked"}</b>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="guild-title-dossier">
          {selectedTitle ? (
            <>
              <header className="ranking-section-heading">
                <div><span>Selected identity</span><h3>{selectedTitle.definition.title}</h3></div>
              </header>
              <div className="guild-title-seal">
                <i>{selectedTitle.definition.sigil}</i>
                <div>
                  <span>{formatAchievementCategory(selectedTitle.definition.category)}</span>
                  <strong>{selectedTitle.unlocked ? "Title available" : "Title locked"}</strong>
                  <small>{selectedTitle.requirementLabel}</small>
                </div>
              </div>
              <p>{selectedTitle.definition.description}</p>
              <div className="guild-title-nameplate">
                <span>Guild nameplate preview</span>
                <strong>{guild.name}</strong>
                <em>{selectedTitle.definition.title}</em>
              </div>
              <button
                className="guild-title-equip"
                disabled={!selectedTitle.unlocked || activeTitle?.id === selectedTitle.definition.id}
                onClick={() => onEquipTitle(selectedTitle.definition.id)}
                type="button"
              >
                {activeTitle?.id === selectedTitle.definition.id ? "Title Equipped" : "Equip Title"}
              </button>
              {activeTitle ? (
                <button className="guild-title-clear" onClick={() => onEquipTitle(null)} type="button">Unequip Title</button>
              ) : null}
              <small className="guild-title-local-note">Guild identity only. Titles are cosmetic and grant no combat or economy bonus.</small>
            </>
          ) : <div className="ranking-empty">No title matches this filter.</div>}
        </aside>
      </div>
    </div>
  );
}

function FilterButton({ active, label, onClick, value }: { active: boolean; label: string; onClick: () => void; value: number }) {
  return <button aria-pressed={active} onClick={onClick} type="button"><strong>{label}</strong><small>{value}</small></button>;
}

function getGuildInitials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "G";
}
