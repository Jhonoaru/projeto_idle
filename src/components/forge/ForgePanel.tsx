import { useMemo, useState } from "react";
import {
  getImbuementById,
  getImbuementFamilyLabel,
  getImbuementPowerLabel,
  imbuementFamilies,
  imbuements,
} from "../../data/imbuements";
import { getItemUpgradeCost } from "../../game-engine/forge/getItemUpgradeCost";
import { getItemTierCost } from "../../game-engine/forge/getItemTierCost";
import { getForgeMaterialsAvailable } from "../../game-engine/forge/getForgeMaterialsAvailable";
import { getImbuementApplicationStatus } from "../../game-engine/forge/getImbuementApplicationStatus";
import { getForgeableItems } from "../../game-engine/forge/forgeInventoryHelpers";
import { calculateEnhancedItemBonuses } from "../../game-engine/forge/calculateEnhancedItemBonuses";
import { formatEnhancedItemName, getItemVisualIdentity, type ItemVisualTier } from "../../game-engine/items/getItemVisualIdentity";
import { getEquipmentProgression } from "../../game-engine/items/getEquipmentProgression";
import { equipmentFamilies, equipmentProgressionBands, equipmentProgressionOrder } from "../../data/equipmentProgression";
import { equipmentSetOrder, equipmentSets } from "../../data/equipmentSets";
import { ForgeMaterialRequirement } from "./ForgeMaterialRequirement";
import { ItemIcon } from "../items/ItemIcon";
import { ItemQualityBadge } from "../items/ItemQualityBadge";
import { ItemProgressionBadge } from "../items/ItemProgressionBadge";
import { EquipmentSetBadge } from "../items/EquipmentSetBadge";
import { formatEquipmentSetBonus } from "../../game-engine/equipment/calculateEquipmentSetBonuses";
import type { Character, EquipmentProgressionBandId, EquipmentSlot, Guild, GuildDepot, ImbuementDefinition, InventoryItem } from "../../shared/types";

interface ForgePanelProps {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  onUpgradeItem: (inventoryItem: InventoryItem) => void;
  onIncreaseTier: (inventoryItem: InventoryItem) => void;
  onApplyImbuement: (inventoryItem: InventoryItem, imbuementId: string) => void;
  onRemoveImbuements: (inventoryItem: InventoryItem, imbuementId?: string) => void;
}

type ForgeFilter = "all" | "weapons" | "armor" | "accessories" | "backpack";

export function ForgePanel({
  character,
  guild,
  guildDepot,
  onUpgradeItem,
  onIncreaseTier,
  onApplyImbuement,
  onRemoveImbuements,
}: ForgePanelProps) {
  const forgeableItems = getForgeableItems(character);
  const [filter, setFilter] = useState<ForgeFilter>("all");
  const [selectedItemId, setSelectedItemId] = useState(forgeableItems[0]?.id);
  const materialsAvailable = getForgeMaterialsAvailable(character, guildDepot);
  const filteredItems = forgeableItems.filter((item) => matchesFilter(item, filter));
  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) ??
    forgeableItems.find((item) => item.id === selectedItemId) ??
    filteredItems[0] ??
    forgeableItems[0];

  const selectedSlot = useMemo(
    () => Object.entries(character.equipment).find(([, item]) => item?.id === selectedItem?.id)?.[0] as EquipmentSlot | undefined,
    [character.equipment, selectedItem?.id],
  );
  const itemSlot = selectedSlot ?? selectedItem?.item.equipmentSlot;
  const selectedBonuses = selectedItem ? calculateEnhancedItemBonuses(selectedItem) : undefined;
  const selectedIdentity = selectedItem ? getItemVisualIdentity(selectedItem.item, selectedItem) : undefined;
  const selectedProgression = selectedItem ? getEquipmentProgression(selectedItem.item) : undefined;

  if (forgeableItems.length === 0) {
    return <div className="empty-list">Nenhum equipamento disponivel para Forge.</div>;
  }

  return (
    <div className="forge-panel">
      <div className="forge-summary">
        <div>
          <span>Arcane Forge</span>
          <strong>{character.name}</strong>
        </div>
        <div>
          <span>Guild Gold</span>
          <strong>{guild.gold.toLocaleString("en-US")}g</strong>
        </div>
        <div>
          <span>Materials Indexed</span>
          <strong>{materialsAvailable.size}</strong>
        </div>
      </div>

      <ForgeRarityLegend />
      <ForgeFamilyLegend />
      <ForgeSetLegend />

      <div className="forge-filters">
        {(["all", "weapons", "armor", "accessories", "backpack"] as ForgeFilter[]).map((option) => (
          <button
            className={filter === option ? "is-selected" : ""}
            key={option}
            onClick={() => setFilter(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      <div className="forge-layout forge-layout-wide">
        <div className="forge-item-list">
          {filteredItems.map((item) => {
            const identity = getItemVisualIdentity(item.item, item);
            return <button
              className={`${identity.surfaceClassName} ${selectedItem?.id === item.id ? "is-selected" : ""}`.trim()}
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              type="button"
            >
              <strong>{formatForgeItemName(item)}</strong>
              <ItemQualityBadge compact inventoryItem={item} />
              <ItemProgressionBadge compact item={item.item} />
              <EquipmentSetBadge compact item={item.item} />
              <span>{item.item.equipmentSlot ?? "equipment"}</span>
              <em>{item.imbuements?.length ?? 0} imbuement(s)</em>
            </button>;
          })}
        </div>

        {selectedItem ? (
          <>
            <div className="forge-details">
              <div className="forge-item-header">
                <ItemIcon inventoryItem={selectedItem} size="large" showQuantity={false} />
                <div>
                  <span>{selectedSlot ? `Equipped: ${selectedSlot}` : "Inventory"}</span>
                  <strong>{formatForgeItemName(selectedItem)}</strong>
                  <ItemQualityBadge inventoryItem={selectedItem} />
                  <ItemProgressionBadge item={selectedItem.item} />
                  <EquipmentSetBadge item={selectedItem.item} />
                  <p>{selectedItem.item.description}</p>
                </div>
              </div>

              {selectedIdentity ? <ForgeQualityTrack currentTier={selectedIdentity.tier} /> : null}
              {selectedProgression ? <EquipmentProgressionTrack currentBand={selectedProgression.bandId} /> : null}

              <div className="forge-action-grid">
                <ForgeActionBox
                  actionLabel="Upgrade"
                  currentLabel={`+${selectedItem.upgradeLevel ?? 0} / +5`}
                  cost={getItemUpgradeCost(selectedItem.upgradeLevel ?? 0)}
                  materialsAvailable={materialsAvailable}
                  onAction={() => onUpgradeItem(selectedItem)}
                />

                <ForgeActionBox
                  actionLabel="Increase Tier"
                  currentLabel={`${selectedIdentity?.tierLabel ?? "Base"} / Tier ${selectedIdentity?.tier ?? 0} of 3`}
                  cost={getItemTierCost(selectedItem.tier ?? 0)}
                  materialsAvailable={materialsAvailable}
                  onAction={() => onIncreaseTier(selectedItem)}
                />
              </div>

              <div className="forge-action-box">
                <div>
                  <span>Active Imbuements</span>
                  <strong>{selectedItem.imbuements?.length ? `${selectedItem.imbuements.length} active` : "None"}</strong>
                </div>
                {(selectedItem.imbuements ?? []).map((active) => {
                  const definition = getImbuementById(active.imbuementId);
                  return (
                    <div className="forge-active-imbuement" key={active.imbuementId}>
                      <p>{definition ? `${definition.name}: ${definition.description}` : active.imbuementId}</p>
                      <span>{active.remainingHunts ?? 0} hunts restantes</span>
                      <button onClick={() => onRemoveImbuements(selectedItem, active.imbuementId)} type="button">
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              {selectedBonuses ? (
                <div className="forge-action-box">
                  <div>
                    <span>Current Bonuses</span>
                    <strong>Includes Forge bonuses</strong>
                  </div>
                  <p>{formatBonusSummary(selectedBonuses)}</p>
                </div>
              ) : null}
            </div>

            <div className="forge-imbuement-list">
              {imbuementFamilies.map((family) => (
                <section className="forge-imbuement-family" key={family.id}>
                  <h3>{family.label}</h3>
                  {imbuements
                    .filter((imbuement) => imbuement.familyId === family.id)
                    .map((imbuement) => (
                      <ImbuementCard
                        character={character}
                        guild={guild}
                        guildDepot={guildDepot}
                        imbuement={imbuement}
                        inventoryItem={selectedItem}
                        key={imbuement.id}
                        onApply={() => onApplyImbuement(selectedItem, imbuement.id)}
                        slot={itemSlot}
                      />
                    ))}
                </section>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function EquipmentProgressionTrack({ currentBand }: { currentBand: EquipmentProgressionBandId }) {
  const currentIndex = equipmentProgressionOrder.indexOf(currentBand);

  return (
    <div className="equipment-progression-track" aria-label="Equipment level progression">
      {equipmentProgressionOrder.map((bandId, index) => {
        const band = equipmentProgressionBands[bandId];
        return (
          <div className={`${bandId === currentBand ? "is-current" : ""} ${index < currentIndex ? "is-complete" : ""} equipment-band-${bandId}`} key={bandId}>
            <span>{band.code}</span>
            <strong>{band.label}</strong>
            <em>Lv {band.minLevel}{band.maxLevel ? `-${band.maxLevel}` : "+"}</em>
          </div>
        );
      })}
    </div>
  );
}

function ForgeRarityLegend() {
  const rarities = ["common", "uncommon", "rare", "epic", "legendary"] as const;

  return (
    <div className="forge-rarity-legend" aria-label="Item rarity progression">
      {rarities.map((rarity) => (
        <span className={`item-rarity-${rarity}`} key={rarity}>
          <i aria-hidden="true" />
          {rarity}
        </span>
      ))}
    </div>
  );
}

function ForgeFamilyLegend() {
  return (
    <div className="forge-family-legend" aria-label="Equipment families">
      {Object.values(equipmentFamilies).map((family) => (
        <span className={`equipment-family-${family.id}`} key={family.id} title={family.description}>
          <i aria-hidden="true">{family.code}</i>
          <strong>{family.label}</strong>
        </span>
      ))}
    </div>
  );
}

function ForgeSetLegend() {
  return (
    <div className="forge-set-legend" aria-label="Equipment campaign sets">
      {equipmentSetOrder.map((setId) => {
        const definition = equipmentSets[setId];
        return (
          <article className={`equipment-set-${setId}`} key={setId} title={definition.description}>
            <i aria-hidden="true">{definition.code}</i>
            <span>
              <strong>{definition.name}</strong>
              <small>{definition.campaignBand}</small>
            </span>
            <em>{definition.thresholds.map((threshold) => `${threshold.pieces}p ${formatEquipmentSetBonus(threshold.bonuses)}`).join(" / ")}</em>
          </article>
        );
      })}
    </div>
  );
}

function ForgeQualityTrack({ currentTier }: { currentTier: ItemVisualTier }) {
  const steps: Array<{ tier: ItemVisualTier; label: string }> = [
    { tier: 0, label: "Base" },
    { tier: 1, label: "Forged I" },
    { tier: 2, label: "Ascendant II" },
    { tier: 3, label: "Exalted III" },
  ];

  return (
    <div className="forge-quality-track" aria-label="Forge tier progression">
      {steps.map((step) => (
        <div className={`${step.tier === currentTier ? "is-current" : ""} ${step.tier < currentTier ? "is-complete" : ""} item-tier-${step.tier}`} key={step.tier}>
          <span>T{step.tier}</span>
          <strong>{step.label}</strong>
        </div>
      ))}
    </div>
  );
}

function ImbuementCard({
  character,
  guild,
  guildDepot,
  imbuement,
  inventoryItem,
  slot,
  onApply,
}: {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  imbuement: ImbuementDefinition;
  inventoryItem: InventoryItem;
  slot?: EquipmentSlot;
  onApply: () => void;
}) {
  const check = getImbuementApplicationStatus(character, guild, guildDepot, inventoryItem, slot, imbuement.id);
  const replacement = getImbuementById(check.willReplaceImbuementId);

  return (
    <article className={`forge-imbuement-card status-${check.status.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="forge-imbuement-title">
        <div>
          <span>{getImbuementPowerLabel(imbuement.powerLevel)} / {getImbuementFamilyLabel(imbuement.familyId)}</span>
          <strong>{imbuement.name}</strong>
        </div>
        <em>{check.status}</em>
      </div>
      <p>{imbuement.description}</p>
      <p>{check.reason}</p>
      <div className="forge-imbuement-meta">
        <span>{imbuement.durationHunts ?? 20} hunts</span>
        <span>{imbuement.goldCost.toLocaleString("en-US")}g</span>
        <span>{imbuement.allowedEquipmentSlots.join(", ")}</span>
      </div>
      {replacement ? <p>Will replace {replacement.name}.</p> : null}
      {imbuement.requiredCharacterLevel ? (
        <p>Unlock: level {imbuement.requiredCharacterLevel} or Tier {imbuement.requiredForgeTier}</p>
      ) : null}
      <div className="forge-material-list">
        {check.materials.map((material) => (
          <ForgeMaterialRequirement key={material.itemId} material={material} />
        ))}
      </div>
      <button disabled={!check.canApply} onClick={onApply} type="button">
        Apply Imbuement
      </button>
    </article>
  );
}

function ForgeActionBox({
  actionLabel,
  currentLabel,
  cost,
  materialsAvailable,
  onAction,
}: {
  actionLabel: string;
  currentLabel: string;
  cost?: { goldCost: number; requiredMaterials: { itemId: string; quantity: number }[] };
  materialsAvailable: Map<string, number>;
  onAction: () => void;
}) {
  return (
    <div className="forge-action-box">
      <div>
        <span>{actionLabel}</span>
        <strong>{currentLabel}</strong>
      </div>
      {cost ? (
        <>
          <p>{cost.goldCost.toLocaleString("en-US")}g</p>
          <ul>
            {cost.requiredMaterials.map((material) => (
              <li key={material.itemId}>
                {material.itemId}: {materialsAvailable.get(material.itemId) ?? 0}/{material.quantity}
              </li>
            ))}
          </ul>
          <button onClick={onAction} type="button">{actionLabel}</button>
        </>
      ) : (
        <p>Maximo atingido.</p>
      )}
    </div>
  );
}

export function formatForgeItemName(item: InventoryItem) {
  return formatEnhancedItemName(item);
}

function matchesFilter(item: InventoryItem, filter: ForgeFilter) {
  if (filter === "all") return true;
  if (filter === "weapons") return item.item.equipmentSlot === "weapon" || item.item.equipmentSlot === "offhand";
  if (filter === "armor") return ["helmet", "armor", "legs", "boots"].includes(item.item.equipmentSlot ?? "");
  if (filter === "accessories") return ["ring", "amulet"].includes(item.item.equipmentSlot ?? "");
  if (filter === "backpack") return item.item.equipmentSlot === "backpack";
  return true;
}

function formatBonusSummary(bonuses: ReturnType<typeof calculateEnhancedItemBonuses>) {
  const entries = [
    bonuses.attack ? `Atk +${bonuses.attack}` : undefined,
    bonuses.defense ? `Def +${bonuses.defense}` : undefined,
    bonuses.armor ? `Arm +${bonuses.armor}` : undefined,
    bonuses.magicPower ? `Magic +${bonuses.magicPower}` : undefined,
    bonuses.distancePower ? `Dist +${bonuses.distancePower}` : undefined,
    bonuses.capacityBonus ? `Cap +${bonuses.capacityBonus}` : undefined,
    bonuses.xpBonusPercent ? `XP +${bonuses.xpBonusPercent}%` : undefined,
    bonuses.supplyReductionPercent ? `Supplies -${bonuses.supplyReductionPercent}%` : undefined,
  ].filter(Boolean);

  return entries.length > 0 ? entries.join(" / ") : "Sem bonus direto.";
}
