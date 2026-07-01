import type { ReturnTypeHack } from "./types";

interface HuntSupplyChecklistProps {
  rows: ReturnTypeHack[];
}

export function HuntSupplyChecklist({ rows }: HuntSupplyChecklistProps) {
  if (rows.length === 0) {
    return <div className="empty-list">Preset sem supplies.</div>;
  }

  return (
    <div className="hunt-prep-checklist">
      {rows.map((row) => (
        <div className={row.missingQuantity > 0 ? "is-missing" : "is-ok"} key={row.itemId}>
          <span>{row.itemName}</span>
          <strong>{row.availableOnCharacter}/{row.requiredQuantity}</strong>
          <em>Depot {row.availableInDepot} / faltam {row.missingQuantity}</em>
        </div>
      ))}
    </div>
  );
}
