import { useEffect, useMemo, useState } from "react";
import { buildGuildArmoryAudit, type GuildArmoryStatus } from "../../game-engine/equipment/buildGuildArmoryAudit";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type {
  Boss,
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutTemplateSlotId,
  GuildLoadoutTemplateTarget,
  HuntArea,
} from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";
import { EquipmentAcquisitionPlanner } from "./EquipmentAcquisitionPlanner";
import { GuildEquipmentAllocationBoard } from "./GuildEquipmentAllocationBoard";
import { GuildLoadoutTemplates } from "./GuildLoadoutTemplates";
import type { GuildEquipmentOrderRequest, GuildEquipmentOrderResult } from "../../game-engine/equipment/executeGuildEquipmentOrder";

type ArmoryFilter = "all" | GuildArmoryStatus;
type ArmoryView = "audit" | "acquisition" | "allocation" | "templates";

interface GuildArmoryHallProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  selectedCharacterId: string;
  onOpenBoss: (boss: Boss) => void;
  onOpenHunt: (hunt: HuntArea) => void;
  onSelectCharacter: (characterId: string) => void;
  onOpenSystem: (tab: "inventory" | "depot" | "forge") => void;
  onExecuteAllEquipmentOrders: () => GuildEquipmentOrderResult;
  onExecuteEquipmentOrder: (request: GuildEquipmentOrderRequest) => GuildEquipmentOrderResult;
  onSaveLoadoutTemplate: (characterId: string, templateSlotId: GuildLoadoutTemplateSlotId, name: string) => void;
  onSaveEditedLoadoutTemplate: (
    characterId: string,
    templateSlotId: GuildLoadoutTemplateSlotId,
    name: string,
    targets: GuildLoadoutTemplateTarget[],
  ) => boolean;
  onClearLoadoutTemplate: (characterId: string, templateSlotId: GuildLoadoutTemplateSlotId) => void;
}

const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "Weapon", offhand: "Offhand", helmet: "Helmet", armor: "Armor", legs: "Legs",
  boots: "Boots", amulet: "Amulet", ring: "Ring", backpack: "Backpack",
};

export function GuildArmoryHall({ characters, depot, guild, selectedCharacterId, onOpenBoss, onOpenHunt, onSelectCharacter, onOpenSystem, onExecuteAllEquipmentOrders, onExecuteEquipmentOrder, onSaveLoadoutTemplate, onSaveEditedLoadoutTemplate, onClearLoadoutTemplate }: GuildArmoryHallProps) {
  const audit = useMemo(() => buildGuildArmoryAudit(characters, depot), [characters, depot]);
  const [view, setView] = useState<ArmoryView>("audit");
  const [filter, setFilter] = useState<ArmoryFilter>("all");
  const [inspectedCharacterId, setInspectedCharacterId] = useState(selectedCharacterId);
  const filteredRoster = audit.roster.filter((entry) => filter === "all" || entry.status === filter);
  const selected = filteredRoster.find((entry) => entry.characterId === inspectedCharacterId) ?? filteredRoster[0];

  useEffect(() => setInspectedCharacterId(selectedCharacterId), [selectedCharacterId]);

  useEffect(() => {
    if (selected && selected.characterId !== inspectedCharacterId) {
      setInspectedCharacterId(selected.characterId);
      onSelectCharacter(selected.characterId);
    }
  }, [selected, inspectedCharacterId, onSelectCharacter]);

  if (audit.roster.length === 0) return <p className="guild-armory-empty">No adventurers are registered in this guild.</p>;

  function selectCharacter(characterId: string) {
    setInspectedCharacterId(characterId);
    onSelectCharacter(characterId);
  }

  function openSystem(tab: "inventory" | "depot" | "forge") {
    if (!selected) return;
    onSelectCharacter(selected.characterId);
    onOpenSystem(tab);
  }

  const viewHeading = view === "audit"
    ? ["Armory Audit", "Compare every loadout and identify compatible upgrades already stored in the Guild Depot."]
    : view === "acquisition"
      ? ["Acquisition Planner", "Connect equipment targets to holdings, hunts, bosses and Guild Workbench recipes."]
      : view === "allocation"
        ? ["Allocation Board", "Distribute finite Guild Depot equipment across the roster by compatible rating gain."]
        : ["Loadout Templates", "Save equipment targets and review where every required piece is currently held."];

  return (
    <div className="guild-armory-hall">
      <section className="guild-armory-hero">
        <div className="guild-armory-seal" aria-hidden="true">A</div>
        <div><span>Guild equipment command</span><h3>{viewHeading[0]}</h3><p>{viewHeading[1]}</p></div>
        <div className="guild-armory-summary">
          <Summary label="Equipped" value={`${audit.summary.equippedSlots}/${audit.summary.totalSlots}`} />
          <Summary label="Missing" value={String(audit.summary.missingSlots)} />
          <Summary label="Upgrade paths" value={`${audit.summary.upgradeCharacters} adventurers`} />
          <Summary label="Depot gear" value={String(audit.summary.depotEquipment)} />
          <Summary label="Set bonuses" value={String(audit.summary.activeSetBonuses)} />
        </div>
      </section>

      <div className="guild-armory-view-tabs" role="tablist" aria-label="Armory view">
        <button aria-selected={view === "audit"} onClick={() => setView("audit")} role="tab" type="button">Armory Audit</button>
        <button aria-selected={view === "acquisition"} onClick={() => setView("acquisition")} role="tab" type="button">Acquisition Planner</button>
        <button aria-selected={view === "allocation"} onClick={() => setView("allocation")} role="tab" type="button">Allocation Board</button>
        <button aria-selected={view === "templates"} onClick={() => setView("templates")} role="tab" type="button">Loadout Templates</button>
      </div>

      {view === "audit" ? <>
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

        {selected ? <div className="guild-armory-workspace">
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
            <button onClick={() => openSystem("inventory")} type="button">Open Inventory</button>
            <button onClick={() => openSystem("depot")} type="button">Open Guild Depot</button>
            <button onClick={() => openSystem("forge")} type="button">Open Forge</button>
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
        </div> : <section className="guild-armory-filter-empty"><strong>No matching loadouts</strong><p>Choose another filter to continue the armory inspection.</p></section>}
      </> : view === "acquisition" ? (
        <EquipmentAcquisitionPlanner
          characters={characters}
          depot={depot}
          guild={guild}
          onOpenBoss={onOpenBoss}
          onOpenForge={() => { onSelectCharacter(inspectedCharacterId); onOpenSystem("forge"); }}
          onOpenHunt={onOpenHunt}
          onOpenInventory={(characterId) => { onSelectCharacter(characterId); onOpenSystem("inventory"); }}
          onSelectCharacter={selectCharacter}
          selectedCharacterId={inspectedCharacterId}
        />
      ) : view === "allocation" ? (
        <GuildEquipmentAllocationBoard
          characters={characters}
          depot={depot}
          onOpenDepot={(characterId) => { onSelectCharacter(characterId); onOpenSystem("depot"); }}
          onOpenForge={(characterId) => { onSelectCharacter(characterId); onOpenSystem("forge"); }}
          onOpenInventory={(characterId) => { onSelectCharacter(characterId); onOpenSystem("inventory"); }}
          onExecuteAllOrders={onExecuteAllEquipmentOrders}
          onExecuteOrder={onExecuteEquipmentOrder}
          onSelectCharacter={selectCharacter}
          selectedCharacterId={inspectedCharacterId}
        />
      ) : (
        <GuildLoadoutTemplates
          characters={characters}
          depot={depot}
          guild={guild}
          onClearTemplate={onClearLoadoutTemplate}
          onOpenQuartermaster={(characterId) => {
            selectCharacter(characterId);
            setView("allocation");
          }}
          onOpenSystem={(tab, characterId) => {
            selectCharacter(characterId);
            onOpenSystem(tab);
          }}
          onSaveTemplate={onSaveLoadoutTemplate}
          onSaveEditedTemplate={onSaveEditedLoadoutTemplate}
          onSelectCharacter={selectCharacter}
          selectedCharacterId={inspectedCharacterId}
        />
      )}
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
