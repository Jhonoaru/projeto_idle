import type { SellSource } from "../../shared/types";

interface SellSummaryPanelProps {
  selectedCount: number;
  selectedGold: number;
  source: SellSource;
  destinationLabel: string;
  onSellSelected: () => void;
  onSellCategory: (category: "creature_product" | "material" | "misc") => void;
}

export function SellSummaryPanel({
  selectedCount,
  selectedGold,
  destinationLabel,
  onSellSelected,
  onSellCategory,
}: SellSummaryPanelProps) {
  return (
    <div className="sell-summary-panel">
      <div className="depot-summary">
        <div>
          <span>Total selecionado</span>
          <strong>{selectedCount}</strong>
        </div>
        <div>
          <span>Gold esperado</span>
          <strong>{selectedGold.toLocaleString("en-US")}g</strong>
        </div>
      </div>

      <div className="market-destination">
        <span>Destino do Gold</span>
        <strong>{destinationLabel}</strong>
      </div>

      <div className="hunt-action-buttons">
        <button disabled={selectedCount === 0} onClick={onSellSelected} type="button">
          Vender Selecionados
        </button>
        <button onClick={() => onSellCategory("creature_product")} type="button">
          Vender Creature Products
        </button>
        <button onClick={() => onSellCategory("material")} type="button">
          Vender Materiais
        </button>
        <button onClick={() => onSellCategory("misc")} type="button">
          Vender Misc
        </button>
      </div>
    </div>
  );
}
