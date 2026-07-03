interface GameCurrencyPillProps {
  label: string;
  value: number | string;
  tone?: "gold" | "future";
}

export function GameCurrencyPill({
  label,
  value,
  tone = "gold",
}: GameCurrencyPillProps) {
  return (
    <div className={`game-currency-pill is-${tone}`}>
      <span>{label}</span>
      <strong>{typeof value === "number" ? value.toLocaleString("en-US") : value}</strong>
    </div>
  );
}
