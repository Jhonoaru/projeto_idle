import { items } from "../../data/items";
import type { ImbuementMaterialStatus } from "../../game-engine/forge/getImbuementApplicationStatus";
import { ItemIcon } from "../items/ItemIcon";

interface ForgeMaterialRequirementProps {
  material: Pick<ImbuementMaterialStatus, "available" | "itemId" | "quantity">;
}

export function ForgeMaterialRequirement({ material }: ForgeMaterialRequirementProps) {
  const item = items[material.itemId];
  const itemName = item?.name ?? material.itemId;
  const isMissing = material.available < material.quantity;

  return (
    <div className={`forge-material ${isMissing ? "is-missing" : "is-ok"}`}>
      <ItemIcon item={item} showBadges={false} showQuantity={false} size="small" />
      <span>{itemName}</span>
      <strong>{material.available}/{material.quantity}</strong>
    </div>
  );
}
