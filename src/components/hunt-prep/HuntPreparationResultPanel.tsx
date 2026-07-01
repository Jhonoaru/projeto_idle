import type { HuntPreparationResult } from "../../shared/types";

interface HuntPreparationResultPanelProps {
  result?: HuntPreparationResult;
}

export function HuntPreparationResultPanel({ result }: HuntPreparationResultPanelProps) {
  if (!result) return null;

  return (
    <div className={`hunt-prep-result ${result.success ? "is-success" : "is-warning"}`}>
      <strong>{result.success ? "Preparation OK" : "Preparation needs attention"}</strong>
      {[...result.logs, ...result.warnings].slice(0, 6).map((message) => (
        <p key={message}>{message}</p>
      ))}
      {result.missingItems?.length ? (
        <p>
          Missing: {result.missingItems.map((item) => `${item.itemName} x${item.quantity}`).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
