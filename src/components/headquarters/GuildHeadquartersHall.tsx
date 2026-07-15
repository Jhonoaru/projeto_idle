import { useMemo, useState } from "react";
import { guildFacilities } from "../../data/guildFacilities";
import { getGuildCareer } from "../../game-engine/achievements/getGuildCareer";
import { getHeadquartersBonuses, getHeadquartersRank } from "../../game-engine/headquarters/getHeadquartersBonuses";
import { normalizeGuildHeadquarters } from "../../game-engine/headquarters/normalizeGuildHeadquarters";
import type { Character, Guild, GuildFacilityDefinition, GuildFacilityId } from "../../shared/types";

interface GuildHeadquartersHallProps {
  characters: Character[];
  guild: Guild;
  onUpgradeFacility: (facilityId: GuildFacilityId) => void;
}

export function GuildHeadquartersHall({ characters, guild, onUpgradeFacility }: GuildHeadquartersHallProps) {
  const headquarters = useMemo(() => normalizeGuildHeadquarters(guild.headquarters), [guild.headquarters]);
  const bonuses = useMemo(() => getHeadquartersBonuses(headquarters), [headquarters]);
  const rank = useMemo(() => getHeadquartersRank(headquarters), [headquarters]);
  const career = useMemo(() => getGuildCareer(guild, characters), [characters, guild]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<GuildFacilityId>(guildFacilities[0].id);
  const selectedFacility = guildFacilities.find((facility) => facility.id === selectedFacilityId) ?? guildFacilities[0];
  const selectedLevel = headquarters.facilityLevels[selectedFacility.id];
  const upgradeCost = selectedFacility.upgradeCosts[selectedLevel];
  const requiredPoints = selectedFacility.careerPointRequirements[selectedLevel];
  const maxed = selectedLevel >= 3;
  const canAfford = maxed || guild.gold >= (upgradeCost ?? Number.POSITIVE_INFINITY);
  const careerReady = maxed || career.points >= (requiredPoints ?? Number.POSITIVE_INFINITY);

  return (
    <div className="headquarters-hall">
      <section className="headquarters-hero">
        <div className="headquarters-banner" aria-hidden="true"><i>H</i><span>{rank.totalLevels}/12</span></div>
        <div className="headquarters-identity">
          <span>Guild headquarters</span>
          <h3>{guild.name} {rank.title}</h3>
          <p>Permanent local facilities funded with guild gold and backed by Career Ledger progress.</p>
        </div>
        <div className="headquarters-summary">
          <Summary label="Facility levels" value={`${rank.totalLevels}/12`} />
          <Summary label="Invested" value={`${headquarters.totalInvestedGold.toLocaleString("en-US")}g`} />
          <Summary label="Guild gold" value={`${guild.gold.toLocaleString("en-US")}g`} />
          <Summary label="Career points" value={`${career.points}`} />
        </div>
      </section>

      <section className="headquarters-bonus-ledger">
        <Bonus label="Hunt XP" value={bonuses.huntXpBonusPercent} />
        <Bonus label="Training progress" value={bonuses.trainingProgressBonusPercent} />
        <Bonus label="NPC discount" value={bonuses.npcPriceDiscountPercent} prefix="-" />
        <Bonus label="Quest XP" value={bonuses.questXpBonusPercent} />
      </section>

      <div className="headquarters-workspace">
        <section className="headquarters-facilities">
          <header className="ranking-section-heading">
            <div><span>Facility plan</span><h3>Headquarters Wings</h3></div>
            <strong>Maximum level 3</strong>
          </header>
          <div className="headquarters-facility-grid">
            {guildFacilities.map((facility) => (
              <FacilityCard
                facility={facility}
                key={facility.id}
                level={headquarters.facilityLevels[facility.id]}
                onSelect={() => setSelectedFacilityId(facility.id)}
                selected={facility.id === selectedFacility.id}
              />
            ))}
          </div>
        </section>

        <aside className="headquarters-dossier">
          <header className="ranking-section-heading">
            <div><span>Selected facility</span><h3>{selectedFacility.name}</h3></div>
            <strong>Level {selectedLevel}/3</strong>
          </header>
          <div className="headquarters-facility-seal">
            <i>{selectedFacility.sigil}</i>
            <div><span>Current benefit</span><strong>{formatBonus(selectedFacility, selectedLevel)}</strong><small>{selectedFacility.bonusLabel}</small></div>
          </div>
          <p>{selectedFacility.description}</p>
          <div className="headquarters-level-track" aria-label={`${selectedFacility.name} level ${selectedLevel} of 3`}>
            {[1, 2, 3].map((level) => <i className={level <= selectedLevel ? "is-built" : ""} key={level}>Lv {level}</i>)}
          </div>
          <div className="headquarters-upgrade-order">
            {maxed ? (
              <strong>Facility fully upgraded</strong>
            ) : (
              <>
                <div><span>Next benefit</span><strong>{formatBonus(selectedFacility, selectedLevel + 1)}</strong></div>
                <div><span>Construction cost</span><strong>{upgradeCost?.toLocaleString("en-US")}g</strong></div>
                <div><span>Career requirement</span><strong>{requiredPoints} points</strong></div>
              </>
            )}
          </div>
          <button
            className="headquarters-upgrade-button"
            disabled={maxed || !canAfford || !careerReady}
            onClick={() => onUpgradeFacility(selectedFacility.id)}
            type="button"
          >
            {maxed ? "Maximum Level" : !careerReady ? `Requires ${requiredPoints} Career Points` : !canAfford ? `Requires ${upgradeCost?.toLocaleString("en-US")}g` : `Upgrade to Level ${selectedLevel + 1}`}
          </button>
          <small className="headquarters-local-note">Facilities are guild-wide, offline and capped. No premium currency or real payment is used.</small>
        </aside>
      </div>
    </div>
  );
}

function FacilityCard({ facility, level, selected, onSelect }: { facility: GuildFacilityDefinition; level: number; selected: boolean; onSelect: () => void }) {
  return (
    <button aria-pressed={selected} className="headquarters-facility-card" onClick={onSelect} type="button">
      <i>{facility.sigil}</i>
      <span><small>{facility.bonusLabel}</small><strong>{facility.name}</strong><em>{formatBonus(facility, level)}</em></span>
      <b>Level {level}/3</b>
      <span className="headquarters-card-track">{[1, 2, 3].map((entry) => <i className={entry <= level ? "is-built" : ""} key={entry} />)}</span>
    </button>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Bonus({ label, value, prefix = "+" }: { label: string; value: number; prefix?: string }) {
  return <div><span>{label}</span><strong>{value > 0 ? `${prefix}${value}%` : "Inactive"}</strong></div>;
}

function formatBonus(facility: GuildFacilityDefinition, level: number) {
  if (level <= 0) return "Inactive";
  const prefix = facility.id === "quartermaster" ? "-" : "+";
  return `${prefix}${facility.bonusPerLevel * level}%`;
}
