import { useEffect, useMemo, useState } from "react";
import { guildLoadoutTemplateSlots } from "../../data/guildLoadoutTemplates";
import { items } from "../../data/items";
import {
  buildGuildLoadoutEditorCatalog,
  type GuildLoadoutCatalogEntry,
  type GuildLoadoutCatalogSourceKind,
} from "../../game-engine/loadout-templates/buildGuildLoadoutEditorCatalog";
import { buildGuildLoadoutTemplateReview, type GuildLoadoutTargetStatus } from "../../game-engine/loadout-templates/buildGuildLoadoutTemplateReview";
import { normalizeGuildLoadoutTemplatesState } from "../../game-engine/loadout-templates/normalizeGuildLoadoutTemplatesState";
import { getGuildLoadoutCaptureTargets } from "../../game-engine/loadout-templates/updateGuildLoadoutTemplate";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutTemplateSlotId,
  GuildLoadoutTemplateTarget,
  InventoryItem,
} from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";

interface GuildLoadoutTemplatesProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  selectedCharacterId: string;
  onClearTemplate: (characterId: string, templateSlotId: GuildLoadoutTemplateSlotId) => void;
  onOpenQuartermaster: (characterId: string) => void;
  onOpenSystem: (tab: "inventory" | "depot" | "forge", characterId: string) => void;
  onSaveTemplate: (characterId: string, templateSlotId: GuildLoadoutTemplateSlotId, name: string) => void;
  onSaveEditedTemplate: (
    characterId: string,
    templateSlotId: GuildLoadoutTemplateSlotId,
    name: string,
    targets: GuildLoadoutTemplateTarget[],
  ) => boolean;
  onSelectCharacter: (characterId: string) => void;
}

const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "Weapon", offhand: "Offhand", helmet: "Helmet", armor: "Armor", legs: "Legs",
  boots: "Boots", amulet: "Amulet", ring: "Ring", backpack: "Backpack",
};

const statusLabels: Record<GuildLoadoutTargetStatus | "unassigned", string> = {
  equipped: "Equipped",
  "guild-depot": "Guild Depot",
  personal: "Personal holding",
  roster: "Other adventurer",
  missing: "Missing",
  incompatible: "Invalid target",
  unassigned: "No target",
};

export function GuildLoadoutTemplates({
  characters,
  depot,
  guild,
  selectedCharacterId,
  onClearTemplate,
  onOpenQuartermaster,
  onOpenSystem,
  onSaveTemplate,
  onSaveEditedTemplate,
  onSelectCharacter,
}: GuildLoadoutTemplatesProps) {
  const safeCharacters = useMemo(
    () => (Array.isArray(characters) ? characters : []).filter((entry) =>
      entry && typeof entry.id === "string" && entry.id.length > 0),
    [characters],
  );
  const state = useMemo(
    () => normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, safeCharacters.map((character) => character.id)),
    [guild.loadoutTemplates, safeCharacters],
  );
  const character = safeCharacters.find((entry) => entry.id === selectedCharacterId) ?? safeCharacters[0];
  const defaultTemplateName = character ? `${character.name} Loadout`.slice(0, 28) : "Guild Loadout";
  const [selectedSlotId, setSelectedSlotId] = useState<GuildLoadoutTemplateSlotId>("loadout-one");
  const template = state.templates.find((entry) =>
    entry.characterId === character?.id && entry.id === selectedSlotId);
  const [name, setName] = useState(template?.name ?? defaultTemplateName);
  const [editingTargets, setEditingTargets] = useState(false);
  const [editorSlot, setEditorSlot] = useState<EquipmentSlot>("weapon");
  const [draftTargets, setDraftTargets] = useState<GuildLoadoutTemplateTarget[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [showIncompatible, setShowIncompatible] = useState(false);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");
  const [minimumTier, setMinimumTier] = useState(0);
  const [minimumUpgradeLevel, setMinimumUpgradeLevel] = useState(0);
  const capturableTargets = useMemo(() => getGuildLoadoutCaptureTargets(character), [character]);
  const savedPlans = state.templates.filter((entry) => entry.characterId === character?.id).length;
  const review = useMemo(
    () => buildGuildLoadoutTemplateReview(template, character, safeCharacters, depot),
    [character, depot, safeCharacters, template],
  );
  const editorCatalog = useMemo(
    () => buildGuildLoadoutEditorCatalog(guild, safeCharacters, depot, character?.id ?? ""),
    [character?.id, depot, guild, safeCharacters],
  );
  const editorEntries = useMemo(() => {
    const search = catalogSearch.trim().toLowerCase();
    return editorCatalog.entries.filter((entry) =>
      entry.slot === editorSlot
      && (showIncompatible || entry.compatibility !== "incompatible")
      && (!search || `${entry.item.name} ${entry.item.rarity} ${entry.item.equipmentFamily ?? ""}`.toLowerCase().includes(search)));
  }, [catalogSearch, editorCatalog.entries, editorSlot, showIncompatible]);
  const selectedCatalogEntry = editorEntries.find((entry) => entry.item.id === selectedCatalogItemId)
    ?? editorEntries.find((entry) => entry.item.id === draftTargets.find((target) => target.slot === editorSlot)?.itemId)
    ?? editorEntries[0];

  useEffect(() => {
    setName(template?.name ?? defaultTemplateName);
    setEditingTargets(false);
  }, [character?.id, defaultTemplateName, selectedSlotId, template?.name]);

  useEffect(() => {
    if (!editingTargets) return;
    const target = draftTargets.find((entry) => entry.slot === editorSlot);
    setSelectedCatalogItemId(target?.itemId ?? "");
    setMinimumTier(target?.minimumTier ?? 0);
    setMinimumUpgradeLevel(target?.minimumUpgradeLevel ?? 0);
  }, [draftTargets, editingTargets, editorSlot]);

  if (!character) return <p className="loadout-template-empty">No adventurers are registered in this guild.</p>;

  return (
    <section className="loadout-templates">
      <div className="loadout-template-summary">
        <Summary label="Saved plans" value={`${savedPlans}/3`} />
        <Summary label="Targets" value={String(review.summary.assigned)} />
        <Summary label="Equipped" value={`${review.summary.equipped}/${review.summary.assigned}`} />
        <Summary label="Depot ready" value={String(review.summary.guildDepot)} />
        <Summary label="Missing" value={String(review.summary.missing)} />
      </div>

      <div className="loadout-template-roster" aria-label="Loadout template roster">
        {safeCharacters.map((entry) => {
          const saved = state.templates.filter((candidate) => candidate.characterId === entry.id).length;
          return (
            <button aria-pressed={entry.id === character.id} key={entry.id} onClick={() => onSelectCharacter(entry.id)} type="button">
              <i>{entry.name.charAt(0)}</i>
              <span><strong>{entry.name}</strong><small>Lv {entry.level} {entry.vocation}</small></span>
              <b>{saved}/3 plans</b>
            </button>
          );
        })}
      </div>

      <div className="loadout-template-slots" role="tablist" aria-label={`${character.name} loadout templates`}>
        {guildLoadoutTemplateSlots.map((slot) => {
          const saved = state.templates.find((entry) => entry.characterId === character.id && entry.id === slot.id);
          return (
            <button aria-selected={slot.id === selectedSlotId} key={slot.id} onClick={() => setSelectedSlotId(slot.id)} role="tab" type="button">
              <i>{slot.shortName}</i>
              <span><strong>{saved?.name ?? slot.name}</strong><small>{saved ? `${saved.targets.length} targets` : "Empty template"}</small></span>
            </button>
          );
        })}
      </div>

      {editingTargets ? (
        <section className="loadout-catalog-editor">
          <header>
            <div><span>Advanced loadout editor</span><strong>{name.trim() || `${character.name} Loadout`}</strong></div>
            <label>
              <span>Template name</span>
              <input maxLength={28} onChange={(event) => setName(event.target.value)} placeholder={`${character.name} Loadout`} value={name} />
            </label>
            <b>{character.name} / {draftTargets.length}/9 targets</b>
          </header>

          <div className="loadout-editor-layout">
            <nav className="loadout-editor-slots" aria-label="Equipment target slots">
              {Object.entries(slotLabels).map(([slot, label]) => {
                const typedSlot = slot as EquipmentSlot;
                const target = draftTargets.find((entry) => entry.slot === typedSlot);
                return (
                  <button aria-pressed={typedSlot === editorSlot} key={slot} onClick={() => setEditorSlot(typedSlot)} type="button">
                    <i>{slotSigil(typedSlot)}</i>
                    <span><strong>{label}</strong><small>{target ? itemsName(target.itemId) : "No target"}</small></span>
                    <b>{target ? `T${target.minimumTier} / +${target.minimumUpgradeLevel}` : "-"}</b>
                  </button>
                );
              })}
            </nav>

            <div className="loadout-editor-catalog">
              <div className="loadout-editor-filters">
                <label>
                  <span>Search {slotLabels[editorSlot]}</span>
                  <input onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Item, rarity or family..." value={catalogSearch} />
                </label>
                <button aria-pressed={showIncompatible} onClick={() => setShowIncompatible((value) => !value)} type="button">
                  {showIncompatible ? "Showing all" : "Compatible only"}
                </button>
              </div>
              <div className="loadout-editor-item-list">
                {editorEntries.map((entry) => {
                  const identity = getItemVisualIdentity(entry.item);
                  return (
                    <button
                      aria-pressed={entry.item.id === selectedCatalogEntry?.item.id}
                      className={`${identity.className} is-${entry.compatibility}`}
                      disabled={entry.compatibility === "incompatible"}
                      key={entry.item.id}
                      onClick={() => {
                        setSelectedCatalogItemId(entry.item.id);
                        const current = draftTargets.find((target) => target.slot === editorSlot && target.itemId === entry.item.id);
                        setMinimumTier(current?.minimumTier ?? 0);
                        setMinimumUpgradeLevel(current?.minimumUpgradeLevel ?? 0);
                      }}
                      type="button"
                    >
                      <ItemIcon item={entry.item} showQuantity={false} size="small" />
                      <span><strong>{entry.item.name}</strong><small>{identity.rarityLabel} / Lv {entry.item.levelRequirement ?? 0}</small></span>
                      <b>{entry.compatibilityLabel}</b>
                    </button>
                  );
                })}
                {editorEntries.length === 0 ? <p>No equipment matches this slot and filter.</p> : null}
              </div>
            </div>

            <aside className="loadout-editor-dossier">
              {selectedCatalogEntry ? (
                <>
                  <header>
                    <ItemIcon item={selectedCatalogEntry.item} showQuantity={false} size="medium" />
                    <div><span>{slotLabels[selectedCatalogEntry.slot]} target</span><strong>{selectedCatalogEntry.item.name}</strong><small>{selectedCatalogEntry.compatibilityLabel}</small></div>
                  </header>
                  <div className="loadout-editor-thresholds">
                    <ThresholdControl label="Minimum tier" max={3} onChange={setMinimumTier} value={minimumTier} />
                    <ThresholdControl label="Minimum upgrade" max={5} onChange={setMinimumUpgradeLevel} prefix="+" value={minimumUpgradeLevel} />
                  </div>
                  <div className="loadout-editor-sources">
                    <span>Known acquisition sources</span>
                    {selectedCatalogEntry.sources.map((source) => (
                      <article className={source.availableNow ? "is-ready" : ""} key={source.id}>
                        <i>{sourceSigil(source.kind)}</i>
                        <div><strong>{source.label}</strong><small>{source.detail}</small></div>
                        <b>{source.availableNow ? "Ready" : sourceKindLabel(source.kind)}</b>
                      </article>
                    ))}
                    {selectedCatalogEntry.sources.length === 0 ? <p>No registered acquisition source.</p> : null}
                  </div>
                  <button
                    disabled={selectedCatalogEntry.compatibility === "incompatible"}
                    onClick={() => {
                      const next: GuildLoadoutTemplateTarget = {
                        slot: editorSlot,
                        itemId: selectedCatalogEntry.item.id,
                        minimumTier,
                        minimumUpgradeLevel,
                      };
                      setDraftTargets((targets) => [...targets.filter((target) => target.slot !== editorSlot), next]);
                    }}
                    type="button"
                  >
                    Apply to {slotLabels[editorSlot]}
                  </button>
                  <button
                    disabled={!draftTargets.some((target) => target.slot === editorSlot)}
                    onClick={() => setDraftTargets((targets) => targets.filter((target) => target.slot !== editorSlot))}
                    type="button"
                  >
                    Remove Target
                  </button>
                </>
              ) : <p>Select a compatible catalog item.</p>}
            </aside>
          </div>

          <footer>
            <small>Planning only. Saving never reserves, purchases, crafts, moves or equips an item.</small>
            <div>
              <button onClick={() => setEditingTargets(false)} type="button">Cancel</button>
              <button
                disabled={draftTargets.length === 0}
                onClick={() => {
                  if (onSaveEditedTemplate(character.id, selectedSlotId, name, draftTargets)) {
                    setEditingTargets(false);
                  }
                }}
                type="button"
              >
                Save Edited Template
              </button>
            </div>
          </footer>
        </section>
      ) : <div className="loadout-template-workspace">
        <section className="loadout-template-editor">
          <header><div><span>Template command</span><strong>{template?.name ?? "Empty loadout slot"}</strong></div><b>{character.name}</b></header>
          <label>
            <span>Template name</span>
            <input maxLength={28} onChange={(event) => setName(event.target.value)} placeholder={`${character.name} Loadout`} value={name} />
          </label>
          <p>Capture the valid equipment currently worn by this adventurer. Empty slots remain outside the plan.</p>
          <div className="loadout-template-editor-actions">
            <button disabled={capturableTargets.length === 0} onClick={() => onSaveTemplate(character.id, selectedSlotId, name)} type="button">
              Save Current Loadout
            </button>
            <button onClick={() => {
              setDraftTargets(template?.targets.map((target) => ({ ...target })) ?? []);
              setEditorSlot(template?.targets[0]?.slot ?? "weapon");
              setCatalogSearch("");
              setShowIncompatible(false);
              setEditingTargets(true);
            }} type="button">Edit Targets</button>
            <button disabled={!template} onClick={() => onClearTemplate(character.id, selectedSlotId)} type="button">Clear</button>
          </div>
          <div className="loadout-template-routing">
            <button onClick={() => onOpenSystem("inventory", character.id)} type="button">Inventory</button>
            <button onClick={() => onOpenSystem("depot", character.id)} type="button">Guild Depot</button>
            <button onClick={() => onOpenSystem("forge", character.id)} type="button">Forge</button>
            <button disabled={!template || review.summary.guildDepot === 0} onClick={() => onOpenQuartermaster(character.id)} type="button">
              Review Quartermaster
            </button>
          </div>
          <small>Templates record targets only. They never reserve, move, forge or equip an item automatically.</small>
        </section>

        <section className="loadout-template-review">
          <header>
            <div><span>Readiness review</span><strong>{template ? `${review.summary.equipped} of ${review.summary.assigned} ready` : "No template saved"}</strong></div>
            <b>{review.summary.guildDepot > 0 ? `${review.summary.guildDepot} in Depot` : "Manual plan"}</b>
          </header>
          <div className="loadout-template-grid">
            {review.reviews.map((entry) => {
              const preview = entry.target && entry.item ? toPreview(entry.target.itemId, entry.item, entry.target.minimumTier, entry.target.minimumUpgradeLevel) : undefined;
              const identity = preview ? getItemVisualIdentity(preview.item, preview) : undefined;
              return (
                <article className={`${identity?.className ?? "is-empty"} is-${entry.status}`} key={entry.slot}>
                  <span>{slotLabels[entry.slot]}</span>
                  <ItemIcon inventoryItem={preview} showQuantity={false} size="small" />
                  <strong>{entry.item?.name ?? "Not assigned"}</strong>
                  <small>{entry.target
                    ? `T${entry.target.minimumTier} / +${entry.target.minimumUpgradeLevel}${entry.compatibilityLabel?.startsWith("Future") ? ` / ${entry.compatibilityLabel}` : ""}${entry.sourceCharacterName ? ` / ${entry.sourceCharacterName}` : ""}`
                    : "This slot is not part of the template."}</small>
                  <em>{statusLabels[entry.status]}</em>
                </article>
              );
            })}
          </div>
        </section>
      </div>}
    </section>
  );
}

function ThresholdControl({
  label,
  max,
  onChange,
  prefix = "",
  value,
}: {
  label: string;
  max: number;
  onChange: (value: number) => void;
  prefix?: string;
  value: number;
}) {
  return (
    <div>
      <span>{label}</span>
      <div>
        <button aria-label={`Decrease ${label}`} disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 1))} type="button">-</button>
        <strong>{prefix}{value}</strong>
        <button aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} type="button">+</button>
      </div>
    </div>
  );
}

function slotSigil(slot: EquipmentSlot) {
  const sigils: Record<EquipmentSlot, string> = {
    weapon: "W", offhand: "O", helmet: "H", armor: "A", legs: "L",
    boots: "B", amulet: "N", ring: "R", backpack: "P",
  };
  return sigils[slot];
}

function sourceSigil(kind: GuildLoadoutCatalogSourceKind) {
  if (kind === "holding") return "I";
  if (kind === "hunt") return "H";
  if (kind === "boss") return "B";
  if (kind === "crafting") return "W";
  return "M";
}

function sourceKindLabel(kind: GuildLoadoutCatalogSourceKind) {
  if (kind === "holding") return "Holding";
  if (kind === "hunt") return "Hunt";
  if (kind === "boss") return "Boss";
  if (kind === "crafting") return "Workbench";
  return "Bazaar";
}

function itemsName(itemId: string) {
  return items[itemId]?.name ?? "Unknown item";
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function toPreview(
  itemId: string,
  item: InventoryItem["item"],
  tier: number,
  upgradeLevel: number,
): InventoryItem {
  return {
    id: `loadout-preview-${itemId}-${tier}-${upgradeLevel}`,
    itemId,
    item,
    quantity: 1,
    location: "guildDepot",
    tier,
    upgradeLevel,
  };
}
