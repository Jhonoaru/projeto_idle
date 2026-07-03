import { ActivityLog } from "../log/ActivityLog";
import { Panel } from "../ui/Panel";
import { getActiveCharacterCosmetics } from "../../game-engine/collections/getActiveCharacterCosmetics";
import { getEstimatedExperiencePreview } from "../../game-engine/progression/experienceTable";
import { normalizeDestinyState } from "../../game-engine/destiny/normalizeDestinyState";
import { getEquippedWeaponProficiencyType } from "../../game-engine/weapon-proficiency/getEquippedWeaponProficiencyType";
import { WEAPON_PROFICIENCY_LABELS } from "../../game-engine/weapon-proficiency/weaponProficiencyDefinitions";
import {
  getWeaponProficiencyProgressPercent,
  normalizeWeaponProficiencies,
} from "../../game-engine/weapon-proficiency/weaponProficiencyProgression";
import { CHARACTER_STATUS_LABELS } from "../../shared/constants";
import type { ActivityLogEntry, Character, EquipmentSlot, Guild, InventoryItem } from "../../shared/types";

interface RightCharacterPanelProps {
  character: Character;
  guild: Guild;
  logs: ActivityLogEntry[];
}

const equipmentSlots: EquipmentSlot[] = [
  "helmet",
  "armor",
  "legs",
  "boots",
  "weapon",
  "offhand",
  "amulet",
  "ring",
  "backpack",
];

export function RightCharacterPanel({ character, guild, logs }: RightCharacterPanelProps) {
  const xpPreview = getEstimatedExperiencePreview(character);
  const levelProgress = Math.round(xpPreview.levelProgressPercent);
  const capacityPercent = Math.min(
    100,
    Math.round((character.capacityUsed / Math.max(1, character.capacityMax)) * 100),
  );
  const rootInventory = character.inventory.filter((item) => !item.parentContainerId).slice(0, 24);
  const proficiencies = normalizeWeaponProficiencies(character.weaponProficiencies);
  const activeWeaponType = getEquippedWeaponProficiencyType(character.equipment.weapon);
  const activeShieldType = getEquippedWeaponProficiencyType(character.equipment.offhand);
  const destiny = normalizeDestinyState(character);
  const activeCosmetics = getActiveCharacterCosmetics(character, guild.collections);

  return (
    <aside className="right-character-panel">
      <Panel title="Character">
        <div className="client-character-card">
          <div className="client-avatar">{activeCosmetics.avatar?.previewValue ?? character.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <span>{character.vocation}</span>
            <strong>{character.name}</strong>
            <p>
              Level {character.level} / {CHARACTER_STATUS_LABELS[character.status]} / {character.city}
            </p>
            <small>
              {activeCosmetics.outfit?.name ?? "No outfit"} / {activeCosmetics.mount?.name ?? "No mount"}
            </small>
          </div>
        </div>
        <div className="client-xp-block">
          <div>
            <span>XP</span>
            <strong>{levelProgress}%</strong>
          </div>
          <div className="level-progress-track" aria-hidden="true">
            <span style={{ width: `${levelProgress}%` }} />
          </div>
          {xpPreview.isEstimated ? <p>Estimated while action is running.</p> : null}
        </div>
        <div className="client-mastery-line">
          <span>Mastery</span>
          <strong>
            {activeWeaponType
              ? `${WEAPON_PROFICIENCY_LABELS[activeWeaponType]} Lv ${proficiencies[activeWeaponType].level}`
              : "No weapon"}
          </strong>
          {activeWeaponType ? (
            <small>
              {Math.round(getWeaponProficiencyProgressPercent(proficiencies[activeWeaponType]))}% to next
            </small>
          ) : null}
          {activeShieldType === "shield" ? (
            <small>Shield Lv {proficiencies.shield.level}</small>
          ) : null}
          <small>Destiny Points: {destiny.availablePoints}</small>
        </div>
      </Panel>

      <Panel title="Equipment">
        <div className="client-equipment-grid">
          {equipmentSlots.map((slot) => (
            <EquipmentCell item={character.equipment[slot]} key={slot} slot={slot} />
          ))}
        </div>
      </Panel>

      <Panel title="Inventory">
        <div className="client-capacity-line">
          <span>Capacity</span>
          <strong>{character.capacityUsed}/{character.capacityMax}</strong>
        </div>
        <div className="capacity-track" aria-hidden="true">
          <span style={{ width: `${capacityPercent}%` }} />
        </div>
        <div className="client-inventory-grid">
          {rootInventory.map((entry) => (
            <InventoryCell entry={entry} key={entry.id} />
          ))}
        </div>
      </Panel>

      <Panel title="Activity">
        <ActivityLog logs={logs.slice(0, 8)} />
      </Panel>
    </aside>
  );
}

function EquipmentCell({
  item,
  slot,
}: {
  item?: InventoryItem;
  slot: EquipmentSlot;
}) {
  return (
    <div className={`client-equipment-cell ${item ? "is-filled" : ""}`}>
      <span>{slot}</span>
      <strong>{item?.item.name ?? "Empty"}</strong>
      {item ? <small>{formatEnhancement(item)}</small> : null}
    </div>
  );
}

function InventoryCell({ entry }: { entry: InventoryItem }) {
  return (
    <div className={`client-inventory-cell rarity-${entry.item.rarity}`}>
      <strong>{entry.item.name}</strong>
      <span>
        {entry.quantity > 1 ? `x${entry.quantity}` : entry.item.rarity}
        {entry.locked ? " / locked" : ""}
      </span>
      {entry.item.isContainer ? <em>bag</em> : null}
    </div>
  );
}

function formatEnhancement(item: InventoryItem) {
  const masteryType = getEquippedWeaponProficiencyType(item);
  const parts = [
    masteryType ? WEAPON_PROFICIENCY_LABELS[masteryType].replace(" Mastery", "") : undefined,
    item.upgradeLevel ? `+${item.upgradeLevel}` : undefined,
    item.tier ? `T${item.tier}` : undefined,
    item.imbuements?.length ? `${item.imbuements.length} imb` : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" / ") : item.item.rarity;
}
