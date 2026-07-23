import { useEffect, useMemo, useState } from "react";
import {
  buildEquipmentAcquisitionPlan,
  type EquipmentAcquisitionSource,
} from "../../game-engine/equipment/buildEquipmentAcquisitionPlan";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type { Boss, Character, EquipmentSlot, Guild, GuildDepot, HuntArea } from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";

interface EquipmentAcquisitionPlannerProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  selectedCharacterId: string;
  onSelectCharacter: (characterId: string) => void;
  onOpenBoss: (boss: Boss) => void;
  onOpenForge: () => void;
  onOpenHunt: (hunt: HuntArea) => void;
  onOpenInventory: (characterId: string) => void;
}

const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "Weapon", offhand: "Offhand", helmet: "Helmet", armor: "Armor", legs: "Legs",
  boots: "Boots", amulet: "Amulet", ring: "Ring", backpack: "Backpack",
};

export function EquipmentAcquisitionPlanner({
  characters,
  depot,
  guild,
  selectedCharacterId,
  onSelectCharacter,
  onOpenBoss,
  onOpenForge,
  onOpenHunt,
  onOpenInventory,
}: EquipmentAcquisitionPlannerProps) {
  const plan = useMemo(() => buildEquipmentAcquisitionPlan(guild, characters, depot), [characters, depot, guild]);
  const selectedCharacter = plan.roster.find((entry) => entry.characterId === selectedCharacterId) ?? plan.roster[0];
  const [selectedTargetKey, setSelectedTargetKey] = useState("");
  const selectedTarget = selectedCharacter?.targets.find((target) => targetKey(target.slot, target.item.id) === selectedTargetKey)
    ?? selectedCharacter?.targets[0];

  useEffect(() => setSelectedTargetKey(""), [selectedCharacter?.characterId]);
  useEffect(() => {
    if (selectedTarget && targetKey(selectedTarget.slot, selectedTarget.item.id) !== selectedTargetKey) {
      setSelectedTargetKey(targetKey(selectedTarget.slot, selectedTarget.item.id));
    }
  }, [selectedTarget, selectedTargetKey]);

  if (!selectedCharacter) return <section className="acquisition-empty"><strong>No adventurers available</strong></section>;

  return (
    <section className="equipment-acquisition-planner">
      <div className="acquisition-summary">
        <Summary label="Roster targets" value={String(plan.summary.targetSlots)} />
        <Summary label="Ready now" value={String(plan.summary.readyTargets)} />
        <Summary label="Hunt / Boss" value={`${plan.summary.huntRoutes} / ${plan.summary.bossRoutes}`} />
        <Summary label="Crafting" value={String(plan.summary.craftingRoutes)} />
      </div>

      <div className="acquisition-roster" aria-label="Equipment acquisition roster">
        {plan.roster.map((entry) => (
          <button aria-pressed={entry.characterId === selectedCharacter.characterId} key={entry.characterId} onClick={() => onSelectCharacter(entry.characterId)} type="button">
            <i>{entry.name.charAt(0)}</i>
            <span><strong>{entry.name}</strong><small>Lv {entry.level} {entry.vocation}</small></span>
            <b>{entry.targets.length} target{entry.targets.length === 1 ? "" : "s"}</b>
            <em>{entry.readyTargets} ready</em>
          </button>
        ))}
      </div>

      {selectedCharacter.targets.length > 0 && selectedTarget ? (
        <div className="acquisition-workspace">
          <div className="acquisition-targets">
            <header><span>{selectedCharacter.name}</span><strong>Upgrade Targets</strong><small>{selectedCharacter.targets.length} sourced slots</small></header>
            <div>
              {selectedCharacter.targets.map((target) => {
                const identity = getItemVisualIdentity(target.item);
                const key = targetKey(target.slot, target.item.id);
                return (
                  <button aria-pressed={key === targetKey(selectedTarget.slot, selectedTarget.item.id)} className={identity.className} key={key} onClick={() => setSelectedTargetKey(key)} type="button">
                    <ItemIcon item={target.item} showQuantity={false} size="small" />
                    <span><small>{slotLabels[target.slot]}</small><strong>{target.item.name}</strong><em>{target.currentItem?.item.name ?? "Empty slot"} / {identity.rarityLabel}</em></span>
                    <b>+{target.delta}</b>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="acquisition-routes">
            <header>
              <div><span>{slotLabels[selectedTarget.slot]} acquisition</span><strong>{selectedTarget.item.name}</strong></div>
              <b>{selectedTarget.targetScore} rating / +{selectedTarget.delta}</b>
            </header>
            <div>
              {selectedTarget.sources.map((source) => (
                <article className={`is-${source.kind} is-${source.status}`} key={source.id}>
                  <i>{sourceSigil(source)}</i>
                  <span><small>{sourceKindLabel(source)}</small><strong>{sourceTitle(source)}</strong><em>{sourceDetail(source)}</em></span>
                  <div><b>{source.statusLabel}</b>{sourceAction(source, { onOpenBoss, onOpenForge, onOpenHunt, onOpenInventory })}</div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="acquisition-empty"><strong>No sourced upgrade target</strong><span>{selectedCharacter.name} has no stronger compatible catalog item outside the Guild Depot with a known route.</span></div>
      )}
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function targetKey(slot: EquipmentSlot, itemId: string) {
  return `${slot}:${itemId}`;
}

function sourceSigil(source: EquipmentAcquisitionSource) {
  if (source.kind === "holding") return "I";
  if (source.kind === "hunt") return "H";
  if (source.kind === "boss") return "B";
  return "W";
}

function sourceKindLabel(source: EquipmentAcquisitionSource) {
  if (source.kind === "holding") return "Guild holding";
  if (source.kind === "hunt") return "Hunt drop";
  if (source.kind === "boss") return "Boss drop";
  return "Guild Workbench";
}

function sourceTitle(source: EquipmentAcquisitionSource) {
  if (source.kind === "holding") return source.characterName;
  if (source.kind === "hunt") return source.hunt.name;
  if (source.kind === "boss") return source.boss.name;
  return source.recipe.name;
}

function sourceDetail(source: EquipmentAcquisitionSource) {
  if (source.kind === "holding") return `${source.locationLabel} / Quantity ${source.quantity}`;
  if (source.kind === "hunt") return `${source.monsterNames.join(", ")} / ${formatChance(source.dropChance)} / Qty ${source.quantityRange}`;
  if (source.kind === "boss") return `${source.boss.city} / ${formatChance(source.dropChance)} / Entry ${source.boss.entryCost.toLocaleString("en-US")}g`;
  return `Rank ${source.recipe.requiredWorkshopRank} / ${source.recipe.goldCost.toLocaleString("en-US")}g / ${source.missingMaterialCount} materials missing`;
}

function sourceAction(
  source: EquipmentAcquisitionSource,
  actions: Pick<EquipmentAcquisitionPlannerProps, "onOpenBoss" | "onOpenForge" | "onOpenHunt" | "onOpenInventory">,
) {
  if (source.kind === "holding") return <button onClick={() => actions.onOpenInventory(source.characterId)} type="button">Open Inventory</button>;
  if (source.kind === "hunt") return <button disabled={source.status !== "ready"} onClick={() => actions.onOpenHunt(source.hunt)} type="button">Open Hunt</button>;
  if (source.kind === "boss") return <button onClick={() => actions.onOpenBoss(source.boss)} type="button">Review Boss</button>;
  return <button onClick={actions.onOpenForge} type="button">Open Forge</button>;
}

function formatChance(value: number) {
  const percent = value * 100;
  return `${percent.toFixed(percent < 1 ? 1 : 0)}% drop`;
}
