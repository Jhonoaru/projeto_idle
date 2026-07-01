import { buyMissingSupplies } from "./buyMissingSupplies";
import { calculateMissingSuppliesForPreset } from "./calculateMissingSuppliesForPreset";
import { moveSuppliesFromDepot } from "./moveSuppliesFromDepot";
import { validateHuntPreset } from "./validateHuntPreset";
import type { Character, Guild, GuildDepot, HuntArea, HuntPreparationResult, HuntSupplyPreset } from "../../shared/types";

export function prepareHuntSupplies(
  guild: Guild,
  character: Character,
  guildDepot: GuildDepot,
  hunt: HuntArea,
  preset: HuntSupplyPreset,
  options = { buyMissing: true, moveFromDepot: true },
) {
  const validation = validateHuntPreset(preset, hunt);
  if (!validation.isValid) {
    return {
      guild,
      character,
      guildDepot,
      result: {
        success: false,
        warnings: validation.warnings,
        logs: validation.warnings,
      } satisfies HuntPreparationResult,
    };
  }

  let currentCharacter = character;
  let currentGuild = guild;
  let currentDepot = guildDepot;
  const logs: string[] = [];
  const warnings: string[] = [];
  let movedItems: HuntPreparationResult["movedItems"] = [];
  let boughtItems: HuntPreparationResult["boughtItems"] = [];

  if (options.moveFromDepot) {
    const moved = moveSuppliesFromDepot(currentCharacter, currentDepot, preset);
    currentCharacter = moved.character;
    currentDepot = moved.guildDepot;
    movedItems = moved.movedItems;
    warnings.push(...moved.warnings);
    logs.push(...moved.movedItems.map((item) => `Movido ${item.itemName} x${item.quantity} do ${item.from} para ${item.to}.`));
  }

  if (options.buyMissing && warnings.length === 0) {
    const bought = buyMissingSupplies(currentGuild, currentCharacter, currentDepot, preset);
    currentGuild = bought.guild;
    currentCharacter = bought.character;
    boughtItems = bought.boughtItems;
    warnings.push(...bought.warnings);
    logs.push(...bought.boughtItems.map((item) => `Comprado ${item.itemName} x${item.quantity} por ${item.totalCost.toLocaleString("en-US")} gold.`));
  }

  const missing = calculateMissingSuppliesForPreset(currentCharacter, currentDepot, preset)
    .filter((item) => item.missingQuantity > 0)
    .map((item) => ({ itemId: item.itemId, itemName: item.itemName, quantity: item.missingQuantity }));

  const success = warnings.length === 0 && missing.length === 0;
  if (success) {
    logs.unshift(`${character.name} preparou supplies para ${hunt.name}.`);
  }

  return {
    guild: currentGuild,
    character: currentCharacter,
    guildDepot: currentDepot,
    result: {
      success,
      missingItems: missing,
      movedItems,
      boughtItems,
      warnings,
      logs,
    } satisfies HuntPreparationResult,
  };
}
