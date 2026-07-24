import { useEffect, useMemo, useState } from "react";
import { guildLoadoutTemplateSlots } from "../../data/guildLoadoutTemplates";
import { buildGuildLoadoutTemplateReview, type GuildLoadoutTargetStatus } from "../../game-engine/loadout-templates/buildGuildLoadoutTemplateReview";
import { normalizeGuildLoadoutTemplatesState } from "../../game-engine/loadout-templates/normalizeGuildLoadoutTemplatesState";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutTemplateSlotId,
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
  onSelectCharacter,
}: GuildLoadoutTemplatesProps) {
  const safeCharacters = characters.filter(Boolean);
  const state = useMemo(
    () => normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, safeCharacters.map((character) => character.id)),
    [guild.loadoutTemplates, safeCharacters],
  );
  const character = safeCharacters.find((entry) => entry.id === selectedCharacterId) ?? safeCharacters[0];
  const [selectedSlotId, setSelectedSlotId] = useState<GuildLoadoutTemplateSlotId>("loadout-one");
  const template = state.templates.find((entry) =>
    entry.characterId === character?.id && entry.id === selectedSlotId);
  const [name, setName] = useState(template?.name ?? "");
  const review = useMemo(
    () => buildGuildLoadoutTemplateReview(template, character, safeCharacters, depot),
    [character, depot, safeCharacters, template],
  );

  useEffect(() => {
    setName(template?.name ?? "");
  }, [character?.id, selectedSlotId, template?.name]);

  if (!character) return <p className="loadout-template-empty">No adventurers are registered in this guild.</p>;

  return (
    <section className="loadout-templates">
      <div className="loadout-template-summary">
        <Summary label="Saved plans" value={String(state.templates.length)} />
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

      <div className="loadout-template-workspace">
        <section className="loadout-template-editor">
          <header><div><span>Template command</span><strong>{template?.name ?? "Empty loadout slot"}</strong></div><b>{character.name}</b></header>
          <label>
            <span>Template name</span>
            <input maxLength={28} onChange={(event) => setName(event.target.value)} placeholder={`${character.name} Loadout`} value={name} />
          </label>
          <p>Capture the valid equipment currently worn by this adventurer. Empty slots remain outside the plan.</p>
          <div className="loadout-template-editor-actions">
            <button disabled={!Object.values(character.equipment ?? {}).some(Boolean)} onClick={() => onSaveTemplate(character.id, selectedSlotId, name)} type="button">
              Save Current Loadout
            </button>
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
                    ? `T${entry.target.minimumTier} / +${entry.target.minimumUpgradeLevel}${entry.sourceCharacterName ? ` / ${entry.sourceCharacterName}` : ""}`
                    : "This slot is not part of the template."}</small>
                  <em>{statusLabels[entry.status]}</em>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
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
