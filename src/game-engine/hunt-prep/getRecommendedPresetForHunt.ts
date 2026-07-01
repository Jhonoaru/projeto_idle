import type { Character, HuntArea, HuntSupplyPreset } from "../../shared/types";

export function getRecommendedPresetForHunt(
  presets: HuntSupplyPreset[] | undefined,
  character: Character,
  hunt: HuntArea,
  durationMinutes: number,
) {
  return (presets ?? []).find(
    (preset) =>
      preset.huntId === hunt.id &&
      preset.durationMinutes === durationMinutes &&
      (preset.characterId === character.id || preset.vocation === character.vocation),
  );
}
