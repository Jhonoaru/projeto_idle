import { shopItems } from "../../data/shopItems";
import { calculateMissingSuppliesForPreset } from "../../game-engine/hunt-prep/calculateMissingSuppliesForPreset";
import { getRecommendedPresetForHunt } from "../../game-engine/hunt-prep/getRecommendedPresetForHunt";
import { HuntPreparationResultPanel } from "./HuntPreparationResultPanel";
import { HuntSupplyChecklist } from "./HuntSupplyChecklist";
import type {
  Character,
  Guild,
  GuildDepot,
  HuntArea,
  HuntPreparationResult,
  HuntSupplyPreset,
} from "../../shared/types";

interface HuntPrepPanelProps {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  hunt: HuntArea;
  durationMinutes: number;
  presets: HuntSupplyPreset[];
  lastPreparationResult?: HuntPreparationResult;
  onCreateRecommendedPreset: () => void;
  onPrepareHunt: (preset: HuntSupplyPreset) => void;
  onDeletePreset: (presetId: string) => void;
}

export function HuntPrepPanel({
  character,
  guild,
  guildDepot,
  hunt,
  durationMinutes,
  presets,
  lastPreparationResult,
  onCreateRecommendedPreset,
  onPrepareHunt,
  onDeletePreset,
}: HuntPrepPanelProps) {
  const matchingPresets = presets.filter(
    (preset) => preset.huntId === hunt.id && (preset.characterId === character.id || preset.vocation === character.vocation),
  );
  const selectedPreset =
    getRecommendedPresetForHunt(presets, character, hunt, durationMinutes) ?? matchingPresets[0];
  const checklist = selectedPreset
    ? calculateMissingSuppliesForPreset(character, guildDepot, selectedPreset)
    : [];
  const goldNeeded = checklist.reduce((sum, row) => {
    const shopItem = shopItems.find((item) => item.itemId === row.itemId);
    return sum + (shopItem?.buyPrice ?? 0) * row.missingAfterDepot;
  }, 0);

  return (
    <div className="hunt-prep-panel">
      <div className="hunt-prep-heading">
        <div>
          <span>Preparation</span>
          <strong>{selectedPreset?.name ?? "Nenhum preset"}</strong>
        </div>
        <div>
          <span>Gold para faltantes</span>
          <strong>{goldNeeded.toLocaleString("en-US")}g / {guild.gold.toLocaleString("en-US")}g</strong>
        </div>
      </div>

      <HuntSupplyChecklist rows={checklist} />

      <div className="hunt-action-buttons">
        <button onClick={onCreateRecommendedPreset} type="button">Criar preset recomendado</button>
        <button disabled={!selectedPreset} onClick={() => selectedPreset && onPrepareHunt(selectedPreset)} type="button">
          Preparar Hunt
        </button>
        <button disabled={!selectedPreset} onClick={() => selectedPreset && onDeletePreset(selectedPreset.id)} type="button">
          Excluir preset
        </button>
      </div>

      <HuntPreparationResultPanel result={lastPreparationResult} />
    </div>
  );
}
