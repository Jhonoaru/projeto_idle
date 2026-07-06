import { ItemIcon } from "../items/ItemIcon";
import type { HuntSceneLootPreview as LootPreview } from "./useHuntSceneSimulation";

interface HuntSceneLootPreviewProps {
  loot: LootPreview[];
}

export function HuntSceneLootPreview({ loot }: HuntSceneLootPreviewProps) {
  return (
    <div className="hunt-scene-loot-preview">
      <span>Visual Drops</span>
      {loot.length > 0 ? (
        loot.map((entry) => (
          <div key={entry.id} style={{ opacity: Math.max(0.35, 1 - entry.agePercent) }}>
            <ItemIcon item={entry.item} quantity={entry.quantity} size="small" />
            <strong>{entry.label}</strong>
            <em>x{entry.quantity}</em>
          </div>
        ))
      ) : (
        <p>No drop preview.</p>
      )}
    </div>
  );
}
