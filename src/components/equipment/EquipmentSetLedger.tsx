import { formatEquipmentSetBonus, getEquipmentSetProgress } from "../../game-engine/equipment/calculateEquipmentSetBonuses";
import type { EquippedItems } from "../../shared/types";

export function EquipmentSetLedger({ equipment }: { equipment: EquippedItems }) {
  const setProgress = getEquipmentSetProgress(equipment);

  return (
    <div className="equipment-set-ledger" aria-label="Equipment set progress">
      {setProgress.map((progress) => (
        <article className={`equipment-set-card equipment-set-${progress.definition.id} ${progress.activeThresholds.length ? "is-active" : ""}`.trim()} key={progress.definition.id}>
          <header>
            <i aria-hidden="true">{progress.definition.code}</i>
            <span>
              <strong>{progress.definition.name}</strong>
              <small>{progress.definition.campaignBand}</small>
            </span>
            <b>{progress.equippedPieces}/{progress.totalPieces}</b>
          </header>
          <div className="equipment-set-pips">
            {progress.definition.pieceGroups.map((group) => (
              <span className={progress.matchedGroupIds.includes(group.id) ? "is-equipped" : ""} key={group.id} title={group.label} />
            ))}
          </div>
          <div className="equipment-set-thresholds">
            {progress.definition.thresholds.map((threshold) => (
              <p className={progress.activeThresholds.includes(threshold.pieces) ? "is-active" : ""} key={threshold.pieces}>
                <strong>{threshold.pieces} pieces / {threshold.label}</strong>
                <span>{formatEquipmentSetBonus(threshold.bonuses)}</span>
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
