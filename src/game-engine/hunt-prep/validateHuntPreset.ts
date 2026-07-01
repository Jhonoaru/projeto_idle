import { items } from "../../data/items";
import type { HuntArea, HuntSupplyPreset } from "../../shared/types";

export function validateHuntPreset(preset: HuntSupplyPreset, hunt?: HuntArea) {
  const warnings: string[] = [];

  if (!hunt || preset.huntId !== hunt.id) {
    warnings.push("Preset invalido: hunt nao encontrada.");
  }

  for (const item of preset.items) {
    if (item.quantity <= 0) warnings.push(`Quantidade invalida em ${item.itemId}.`);
    if (!items[item.itemId]) warnings.push(`Item removido do catalogo: ${item.itemId}.`);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
