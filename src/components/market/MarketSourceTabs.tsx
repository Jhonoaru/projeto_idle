import type { SellSource } from "../../shared/types";

const sources: Array<{ source: SellSource; label: string }> = [
  { source: "character_inventory", label: "Inventário do Personagem" },
  { source: "character_depot", label: "Depot do Personagem" },
  { source: "guild_depot", label: "Depot da Guilda" },
];

interface MarketSourceTabsProps {
  activeSource: SellSource;
  onChangeSource: (source: SellSource) => void;
}

export function MarketSourceTabs({
  activeSource,
  onChangeSource,
}: MarketSourceTabsProps) {
  return (
    <div className="market-source-tabs">
      {sources.map((entry) => (
        <button
          className={activeSource === entry.source ? "is-selected" : ""}
          key={entry.source}
          onClick={() => onChangeSource(entry.source)}
          type="button"
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}
