import { useEffect, useMemo, useState } from "react";
import { getItemById } from "../../data/items";
import { getClockElapsedMs, getClockRemainingMs } from "../../shared/time";
import type { Character, CharacterAction, HuntArea, Item, Monster } from "../../shared/types";

const creaturePositions = ["top-left", "top-right", "left", "right", "bottom-left", "bottom-right"];

export interface HuntSceneCreature {
  id: string;
  monster: Monster;
  position: string;
  hpPercent: number;
  state: "spawning" | "alive" | "damaged" | "defeated";
}

export interface HuntSceneLootPreview {
  id: string;
  item?: Item;
  label: string;
  quantity: number;
  agePercent: number;
}

export interface HuntSceneSnapshot {
  visibleCreatures: HuntSceneCreature[];
  activeTargetId?: string;
  actionText: string;
  combatLogLines: string[];
  lootPreviewEvents: HuntSceneLootPreview[];
  attackProgress: number;
  sceneProgress: number;
  elapsedMs: number;
  remainingMs: number;
  totalMs: number;
  readyToResolve: boolean;
}

export function useHuntSceneSimulation(
  character: Character,
  action: CharacterAction | undefined,
  hunt: HuntArea | undefined,
  monsters: Monster[],
): HuntSceneSnapshot {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!action || action.type !== "hunting" || action.readyToResolve) return undefined;

    const interval = window.setInterval(() => setTick((current) => current + 1), 500);
    return () => window.clearInterval(interval);
  }, [action]);

  return useMemo(() => {
    const totalMs = Math.max(1, (action?.durationMinutes ?? 1) * 60_000);
    const readyToResolve = action?.readyToResolve === true;
    const elapsedMs = readyToResolve ? totalMs : Math.min(totalMs, getClockElapsedMs(action?.startedAt ?? ""));
    const remainingMs = readyToResolve ? 0 : Math.max(0, getClockRemainingMs(action?.endsAt ?? ""));
    const sceneProgress = clampPercent(elapsedMs / totalMs);
    const cycleMs = 4_500;
    const cyclePosition = readyToResolve ? cycleMs : (elapsedMs + tick * 173) % cycleMs;
    const cyclePercent = cyclePosition / cycleMs;
    const attackProgress = readyToResolve ? 1 : ((elapsedMs % 1_800) / 1_800);
    const safeMonsters = monsters.length > 0 ? monsters : [];
    const activeIndex = safeMonsters.length > 0 ? Math.floor(elapsedMs / cycleMs) % safeMonsters.length : 0;

    const visibleCreatures = safeMonsters.slice(0, 6).map((monster, index) => {
      const offset = (cyclePercent + index * 0.19) % 1;
      const hpPercent = readyToResolve ? 0 : Math.max(0, Math.round((1 - offset) * 100));
      const state: HuntSceneCreature["state"] = readyToResolve || hpPercent <= 8
        ? "defeated"
        : hpPercent > 82
          ? "spawning"
          : hpPercent < 46
            ? "damaged"
            : "alive";

      return {
        id: `${monster.id}-${index}`,
        monster,
        position: creaturePositions[index % creaturePositions.length],
        hpPercent,
        state,
      };
    });

    const activeTarget = visibleCreatures[activeIndex % Math.max(1, visibleCreatures.length)];
    const lootPreviewEvents = createLootPreviewEvents(hunt, elapsedMs, readyToResolve);
    const combatLogLines = createCombatLogLines(character, hunt, activeTarget?.monster, lootPreviewEvents, readyToResolve, action);

    return {
      visibleCreatures,
      activeTargetId: activeTarget?.id,
      actionText: getActionText(character, attackProgress),
      combatLogLines,
      lootPreviewEvents,
      attackProgress,
      sceneProgress,
      elapsedMs,
      remainingMs,
      totalMs,
      readyToResolve,
    };
  }, [action, character, hunt, monsters, tick]);
}

function createLootPreviewEvents(hunt: HuntArea | undefined, elapsedMs: number, readyToResolve: boolean) {
  if (!hunt || hunt.monsters.length === 0) return [];

  const loot = hunt.monsters
    .flatMap((monster) => monster.lootTable)
    .filter((entry) => entry.itemId !== "gold-coin")
    .slice(0, 4);

  if (loot.length === 0) return [];

  const count = readyToResolve ? Math.min(3, loot.length) : Math.min(2, loot.length);
  return Array.from({ length: count }).map((_, index) => {
    const lootEntry = loot[(Math.floor(elapsedMs / 3_500) + index) % loot.length];
    const item = findItemById(lootEntry.itemId);
    const agePercent = readyToResolve ? 0.25 : ((elapsedMs + index * 900) % 3_500) / 3_500;

    return {
      id: `${lootEntry.itemId}-${index}`,
      item,
      label: item?.name ?? lootEntry.itemId,
      quantity: Math.max(1, lootEntry.minQuantity),
      agePercent,
    };
  });
}

function findItemById(itemId: string) {
  try {
    return getItemById(itemId);
  } catch {
    return undefined;
  }
}

function createCombatLogLines(
  character: Character,
  hunt: HuntArea | undefined,
  monster: Monster | undefined,
  lootPreviewEvents: HuntSceneLootPreview[],
  readyToResolve: boolean,
  action?: CharacterAction,
) {
  const targetName = monster?.name ?? hunt?.monsters[0]?.name ?? "creature";
  const lines = [
    `${character.name} ${getVerb(character)} ${targetName}.`,
    `${targetName} takes visual damage.`,
    lootPreviewEvents[0] ? `Loot spotted: ${lootPreviewEvents[0].label} x${lootPreviewEvents[0].quantity}.` : undefined,
    hunt?.supplies?.[0] ? `Supply check: ${hunt.supplies[0].itemName}.` : undefined,
    action?.autoRepeat?.enabled ? `Auto-repeat ON: run ${action.repeatIndex ?? 1}/${action.maxRepeatIndex ?? action.autoRepeat.maxRepeats ?? "?"}.` : undefined,
    readyToResolve ? "Hunt completed. Result is ready to collect." : "Weapon proficiency training in progress.",
  ];

  return lines.filter((line): line is string => Boolean(line)).slice(-8);
}

function getActionText(character: Character, attackProgress: number) {
  if (attackProgress > 0.72) return "Recovering";
  if (character.vocation === "Arcanist" || character.vocation === "Warden") return "Casting";
  if (character.vocation === "Ranger") return "Shooting";
  return "Attacking";
}

function getVerb(character: Character) {
  if (character.vocation === "Arcanist" || character.vocation === "Warden") return "casts at";
  if (character.vocation === "Ranger") return "shoots";
  return "hits";
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
