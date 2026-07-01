import type { CharmDefinition } from "../../shared/types";

interface CharmCardProps {
  charm: CharmDefinition;
  isUnlocked: boolean;
  isAssignedToSelected: boolean;
  canUnlock: boolean;
  canAssign: boolean;
  selectedMonsterName?: string;
  onUnlock: () => void;
  onAssign: () => void;
  onRemove: () => void;
}

export function CharmCard({
  charm,
  isUnlocked,
  isAssignedToSelected,
  canUnlock,
  canAssign,
  selectedMonsterName,
  onUnlock,
  onAssign,
  onRemove,
}: CharmCardProps) {
  const assignLabel = selectedMonsterName ? "Assign" : "Select creature";

  return (
    <div className="charm-card">
      <div>
        <span>{charm.type}</span>
        <strong>{charm.name}</strong>
        <p>{charm.description}</p>
        <em>{isUnlocked ? "Unlocked" : `${charm.unlockCost} charm points`}</em>
      </div>
      {!isUnlocked ? (
        <button disabled={!canUnlock} onClick={onUnlock} type="button">Unlock</button>
      ) : isAssignedToSelected ? (
        <button onClick={onRemove} type="button">Remove</button>
      ) : (
        <button disabled={!canAssign} onClick={onAssign} type="button">
          {assignLabel}
        </button>
      )}
    </div>
  );
}
