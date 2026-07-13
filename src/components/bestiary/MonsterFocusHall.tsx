import { useEffect, useState } from "react";
import {
  monsterFocusBonusDescriptions,
  monsterFocusBonusLabels,
  monsterFocusBonusTypes,
  monsterFocusConfig,
} from "../../data/monsterFocus";
import { getAvailableFocusMonsters } from "../../game-engine/monster-focus/getAvailableFocusMonsters";
import { normalizeMonsterFocusState } from "../../game-engine/monster-focus/normalizeMonsterFocusState";
import { getMonsterFocusRerollCost } from "../../game-engine/monster-focus/rerollMonsterFocusBonus";
import type { Character, Guild, MonsterFocusBonusType } from "../../shared/types";

interface MonsterFocusHallProps {
  character: Character;
  guild: Guild;
  onActivate: (slotIndex: number, monsterId: string, bonusType: MonsterFocusBonusType) => void;
  onClear: (slotIndex: number) => void;
  onOpenBestiary: () => void;
  onReroll: (slotIndex: number) => void;
}

export function MonsterFocusHall({
  character,
  guild,
  onActivate,
  onClear,
  onOpenBestiary,
  onReroll,
}: MonsterFocusHallProps) {
  const focus = normalizeMonsterFocusState(character.monsterFocus);
  const knownMonsters = getAvailableFocusMonsters(guild.bestiary);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [selectedMonsterId, setSelectedMonsterId] = useState(knownMonsters[0]?.monsterId ?? "");
  const [selectedBonusType, setSelectedBonusType] = useState<MonsterFocusBonusType>("experience");
  const selectedSlot = focus.slots[selectedSlotIndex] ?? focus.slots[0];
  const activeCount = focus.slots.filter((slot) => slot.status === "active").length;
  const canActivate = Boolean(selectedMonsterId) &&
    (selectedSlot?.status === "empty" || selectedSlot?.status === "expired");

  useEffect(() => {
    if (!focus.slots[selectedSlotIndex] || focus.slots[selectedSlotIndex].status === "locked") {
      setSelectedSlotIndex(focus.slots.find((slot) => slot.status !== "locked")?.slotIndex ?? 0);
    }
  }, [character.id, focus.slots, selectedSlotIndex]);

  useEffect(() => {
    if (knownMonsters.length === 0) {
      if (selectedMonsterId !== "") setSelectedMonsterId("");
      return;
    }

    if (!knownMonsters.some((monster) => monster.monsterId === selectedMonsterId)) {
      setSelectedMonsterId(knownMonsters[0]?.monsterId ?? "");
    }
  }, [knownMonsters, selectedMonsterId]);

  return (
    <div className="hunting-research-hall monster-focus-hall">
      <section className="research-hall-hero">
        <div className="research-hall-seal"><span>F</span><i /></div>
        <div className="research-hall-identity">
          <span>Personal hunting research</span>
          <h3>{character.name}'s Monster Focus</h3>
          <p>{character.vocation} / Level {character.level} / {character.city}</p>
        </div>
        <div className="research-hall-summary">
          <SummaryStat label="Known targets" value={`${knownMonsters.length}`} />
          <SummaryStat label="Active contracts" value={`${activeCount}/1`} />
          <SummaryStat label="Guild gold" value={`${guild.gold.toLocaleString("en-US")}g`} />
        </div>
      </section>

      <nav className="research-hall-tabs" aria-label="Hunting research sections">
        <button onClick={onOpenBestiary} type="button">Bestiary Registry</button>
        <button className="is-active" type="button">Monster Focus</button>
      </nav>

      <section className="focus-slot-deck">
        <ResearchHeading eyebrow="Contract slots" title="Hunter Assignments" value={`${activeCount} active`} />
        <div className="monster-focus-slots">
          {focus.slots.map((slot) => (
            <button
              className={`monster-focus-slot is-${slot.status} ${selectedSlotIndex === slot.slotIndex ? "is-selected" : ""}`.trim()}
              disabled={slot.status === "locked"}
              key={slot.slotIndex}
              onClick={() => setSelectedSlotIndex(slot.slotIndex)}
              type="button"
            >
              <span>Slot {slot.slotIndex + 1}</span>
              <strong>{formatFocusSlotTitle(slot, knownMonsters)}</strong>
              <small>{formatFocusSlotDetail(slot)}</small>
            </button>
          ))}
        </div>
      </section>

      {selectedSlot?.status === "active" ? (
        <section className="focus-active-contract">
          <div className="focus-contract-sigil">{getMonsterSigil(formatFocusSlotTitle(selectedSlot, knownMonsters))}</div>
          <ContractStat label="Active target" value={formatFocusSlotTitle(selectedSlot, knownMonsters)} />
          <ContractStat label="Study" value={selectedSlot.bonusType ? monsterFocusBonusLabels[selectedSlot.bonusType] : "-"} />
          <ContractStat label="Power" value={`${selectedSlot.bonusPercent ?? 0}%`} />
          <ContractStat label="Remaining" value={`${selectedSlot.remainingHunts ?? 0}/10 hunts`} />
          <div className="focus-contract-actions">
            <button onClick={() => onReroll(selectedSlot.slotIndex)} type="button">
              Reroll {getMonsterFocusRerollCost(character, selectedSlot.slotIndex).toLocaleString("en-US")}g
            </button>
            <button onClick={() => onClear(selectedSlot.slotIndex)} type="button">Clear</button>
          </div>
        </section>
      ) : null}

      <div className="focus-workbench">
        <section className="focus-target-archive">
          <ResearchHeading eyebrow="Known creatures" title="Target Archive" value={`${knownMonsters.length}`} />
          <div className="focus-target-list">
            {knownMonsters.length > 0 ? knownMonsters.map((monster) => (
              <button
                className={selectedMonsterId === monster.monsterId ? "is-selected" : ""}
                key={monster.monsterId}
                onClick={() => setSelectedMonsterId(monster.monsterId)}
                type="button"
              >
                <span className="focus-target-sigil">{getMonsterSigil(monster.monsterName)}</span>
                <span><strong>{monster.monsterName}</strong><small>{monster.stage} / {monster.kills} kills</small></span>
              </button>
            )) : (
              <div className="research-empty-state"><strong>No known creatures</strong><span>Complete a hunt to register the first target.</span></div>
            )}
          </div>
        </section>

        <section className="focus-study-board">
          <ResearchHeading eyebrow="Field doctrine" title="Select Study Bonus" value={selectedMonsterId ? "Target ready" : "No target"} />
          <div className="monster-focus-bonus-grid">
            {monsterFocusBonusTypes.map((type) => (
              <button
                className={selectedBonusType === type ? "is-selected" : ""}
                key={type}
                onClick={() => setSelectedBonusType(type)}
                type="button"
              >
                <span className={`focus-bonus-sigil is-${type}`}>{getBonusSigil(type)}</span>
                <span><strong>{monsterFocusBonusLabels[type]}</strong><small>{monsterFocusBonusDescriptions[type]}</small></span>
                <em>+{monsterFocusConfig.bonusPercentByType[type]}%</em>
              </button>
            ))}
          </div>
          <button
            className="focus-activate-command"
            disabled={!canActivate}
            onClick={() => onActivate(selectedSlot?.slotIndex ?? 0, selectedMonsterId, selectedBonusType)}
            type="button"
          >
            {selectedSlot?.status === "active" ? "Clear active slot first" : "Activate focus contract"}
          </button>
        </section>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function ResearchHeading({ eyebrow, title, value }: { eyebrow: string; title: string; value: string }) {
  return <header className="research-section-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div><strong>{value}</strong></header>;
}

function ContractStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function formatFocusSlotTitle(
  slot: ReturnType<typeof normalizeMonsterFocusState>["slots"][number],
  knownMonsters: ReturnType<typeof getAvailableFocusMonsters>,
) {
  if (slot.status === "locked") return "Locked";
  if (slot.status === "empty") return "Empty";
  if (!slot.monsterId) return "Invalid target";
  return knownMonsters.find((monster) => monster.monsterId === slot.monsterId)?.monsterName ?? slot.monsterId;
}

function formatFocusSlotDetail(slot: ReturnType<typeof normalizeMonsterFocusState>["slots"][number]) {
  if (slot.status === "locked") return "Future slot";
  if (slot.status === "empty") return "Ready for a target";
  if (!slot.bonusType) return "Invalid bonus";
  return `${monsterFocusBonusLabels[slot.bonusType]} / ${slot.bonusPercent ?? 0}% / ${slot.remainingHunts ?? 0} hunts`;
}

function getMonsterSigil(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function getBonusSigil(type: MonsterFocusBonusType) {
  if (type === "experience") return "XP";
  if (type === "supplies") return "SP";
  if (type === "risk") return "DF";
  return type.slice(0, 2).toUpperCase();
}
