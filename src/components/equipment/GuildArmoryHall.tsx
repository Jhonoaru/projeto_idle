import { useEffect, useMemo, useState } from "react";
import { buildGuildArmoryAudit, type GuildArmoryStatus } from "../../game-engine/equipment/buildGuildArmoryAudit";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type { Character, EquipmentSlot, GuildDepot } from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";

type ArmoryFilter = "all" | GuildArmoryStatus;

interface GuildArmoryHallProps {
  characters: Character[];
  depot: GuildDepot;
  selectedCharacterId: string;
  onSelectCharacter: (characterId: string) => void;
  onOpenSystem: (tab: "inventory" | "depot" | "forge") => void;
}

const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "Weapon", offhand: "Offhand", helmet: "Helmet", armor: "Armor", legs: "Legs",
  boots: "Boots", amulet: "Amulet", ring: "Ring", backpack: "Backpack",
};

export function GuildArmoryHall({ characters, depot, selectedCharacterId, onSelectCharacter, onOpenSystem }: GuildArmoryHallProps) {
  const audit = useMemo(() => buildGuildArmoryAudit(characters, depot), [characters, depot]);
  const [filter, setFilter] = useState<ArmoryFilter>("all");
  const [inspectedCharacterId, setInspectedCharacterId] = useState(selectedCharacterId);
  const filteredRoster = audit.roster.filter((entry) => filter === "all" || entry.status === filter);
  const selected = filteredRoster.find((entry) => entry.characterId === inspectedCharacterId) ?? filteredRoster[0] ?? audit.roster[0];

  useEffect(() => setInspectedCharacterId(selectedCharacterId), [selectedCharacterId]);

  useEffect(() => {
    if (selected && selected.characterId !== inspectedCharacterId) setInspectedCharacterId(selected.characterId);
  }, [selected, inspectedCharacterId]);

  if (!selected) return <p className="guild-armory-empty">No adventurers are registered in this guild.</p>;

  function selectCharacter(characterId: string) {
    setInspectedCharacterId(characterId);
    onSelectCharacter(characterId);
  }

  return (
    <div className="guild-armory-hall">
      <section className="guild-armory-hero">
        <div className="guild-armory-seal" aria-hidden="true">A</div>
        <div><span>Guild equipment command</span><h3>Armory Audit</h3><p>Compare every loadout and identify compatible upgrades already stored in the Guild Depot.</p></div>
        <div className="guild-armory-summary">
          <Summary label="Equipped" value={`${audit.summary.equippedSlots}/${audit.summary.totalSlots}`} />
          <Summary label="Missing" value={String(audit.summary.missingSlots)} />
          <Summary label="Upgrade paths" value={`${audit.summary.upgradeCharacters} adventurers`} />
          <Summary label="Depot gear" value={String(audit.summary.depotEquipment)} />
          <Summary label="Set bonuses" value={String(audit.summary.activeSetBonuses)} />
        </div>
      </section>

      <section className="guild-armory-roster">
        <header><div><span>Roster inspection</span><h3>Loadout Status</h3></div><strong>{filteredRoster.length}/{audit.roster.length} shown</strong></header>
        <div className="guild-armory-toolbar" role="group" aria-label="Armory roster filter">
          <button aria-pressed={filter === "all"} onClick={() => setFilter("all")} type="button">All</button>
          <button aria-pressed={filter === "upgrade"} onClick={() => setFilter("upgrade")} type="button">Upgrades</button>
          <button aria-pressed={filter === "incomplete"} onClick={() => setFilter("incomplete")} type="button">Missing Gear</button>
          <button aria-pressed={filter === "equipped"} onClick={() => setFilter("equipped")} type="button">Complete</button>
        </div>
        <div className="guild-armory-roster-grid">
          {filteredRoster.map((entry) => (
            <button aria-pressed={entry.characterId === selected.characterId} key={entry.characterId} onClick={() => selectCharacter(entry.characterId)} type="button">
              <i>{entry.name.charAt(0)}</i>
              <span><strong>{entry.name}</strong><small>Lv {entry.level} {entry.vocation} / {entry.characterStatus}</small></span>
              <b className={`is-${entry.status}`}>{statusLabel(entry.status)}</b>
              <em>{entry.equippedCount}/9 / {entry.totalScore} rating</em>
            </button>
          ))}
          {filteredRoster.length === 0 ? <p>No adventurers match this armory filter.</p> : null}
        </div>
      </section>

      <div className="guild-armory-workspace">
        <section className="guild-armory-loadout">
          <SectionHeading eyebrow={`${selected.vocation} / Level ${selected.level}`} title={`${selected.name} Loadout`} value={`${selected.equippedCount}/9 equipped`} />
          <div className="guild-armory-slot-grid">
            {selected.slots.map((slot) => {
              const identity = getItemVisualIdentity(slot.equipped?.item, slot.equipped);
              return (
                <article className={slot.equipped ? identity.className : "is-empty"} key={slot.slot}>
                  <span>{slotLabels[slot.slot]}</span>
                  <ItemIcon inventoryItem={slot.equipped} size="medium" showQuantity={false} />
                  <strong>{slot.equipped?.item.name ?? "Empty"}</strong>
                  <small>{slot.equipped ? `${identity.rarityLabel} / ${identity.upgradeLabel} / ${slot.currentScore} rating` : "No item equipped"}</small>
                </article>
              );
            })}
          </div>
          <div className="guild-armory-command-row">
            <button onClick={() => { onSelectCharacter(selected.characterId); onOpenSystem("inventory"); }} type="button">Open Inventory</button>
            <button onClick={() => onOpenSystem("depot")} type="button">Open Guild Depot</button>
            <button onClick={() => onOpenSystem("forge")} type="button">Open Forge</button>
          </div>
        </section>

        <aside className="guild-armory-recommendations">
          <SectionHeading eyebrow="Compatible depot equipment" title="Upgrade Candidates" value={`${selected.recommendations.length} found`} />
          <div>
            {selected.recommendations.length > 0 ? selected.recommendations.map((recommendation) => {
              const identity = getItemVisualIdentity(recommendation.item.item, recommendation.item);
              return (
                <article className={identity.className} key={`${recommendation.slot}-${recommendation.item.id}`}>
                  <ItemIcon inventoryItem={recommendation.item} size="small" showQuantity={false} />
                  <span><small>{slotLabels[recommendation.slot]} / Guild Depot</small><strong>{recommendation.item.item.name}</strong><em>{identity.combinedLabel}</em></span>
                  <b>+{recommendation.delta}</b>
                </article>
              );
            }) : <p>No stronger compatible equipment is currently stored in the Guild Depot.</p>}
          </div>
          <section className="guild-armory-sets">
            <span>Equipment sets</span>
            {selected.setProgress.length > 0 ? selected.setProgress.map((progress) => (
              <div key={progress.definition.id}><strong>{progress.definition.name}</strong><small>{progress.equippedPieces}/{progress.totalPieces} pieces{progress.nextThreshold ? ` / next bonus at ${progress.nextThreshold}` : " / all thresholds active"}</small></div>
            )) : <p>No equipment set pieces are currently equipped.</p>}
          </section>
          <small className="guild-armory-note">Recommendations compare current enhanced stats and vocation relevance. Moving and equipping items remains manual.</small>
        </aside>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function SectionHeading({ eyebrow, title, value }: { eyebrow: string; title: string; value: string }) {
  return <header className="guild-armory-section-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div><strong>{value}</strong></header>;
}

function statusLabel(status: GuildArmoryStatus) {
  if (status === "upgrade") return "Upgrade found";
  if (status === "incomplete") return "Missing gear";
  return "Complete";
}
