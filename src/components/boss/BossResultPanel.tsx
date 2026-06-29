import type { BossSimulationResult, Character } from "../../shared/types";

interface BossResultPanelProps {
  result?: BossSimulationResult;
  characters: Character[];
}

export function BossResultPanel({ result, characters }: BossResultPanelProps) {
  if (!result) {
    return <div className="empty-list">No boss result yet.</div>;
  }

  const deadNames = result.diedCharacterIds
    .map((characterId) => characters.find((character) => character.id === characterId)?.name)
    .filter(Boolean);

  return (
    <div className="boss-result-panel">
      <div className="result-title-row">
        <div>
          <span>Boss</span>
          <strong>{result.bossName}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{result.defeated ? "Defeated" : "Failed"}</strong>
        </div>
        <em>{result.durationMinutes} min</em>
      </div>

      <div className="result-grid">
        <div>
          <span>XP</span>
          <strong>{result.experienceGained.toLocaleString("en-US")}</strong>
        </div>
        <div>
          <span>Gold</span>
          <strong>{result.goldGained.toLocaleString("en-US")}</strong>
        </div>
        <div>
          <span>Renown</span>
          <strong>{result.renownGained}</strong>
        </div>
        <div>
          <span>Cooldowns</span>
          <strong>{result.cooldownsApplied.length}</strong>
        </div>
      </div>

      <div className="result-section">
        <h3>Deaths</h3>
        <p>{deadNames.length > 0 ? deadNames.join(", ") : "No deaths."}</p>
      </div>

      <div className="result-section">
        <h3>Loot sent to Guild Depot</h3>
        {result.loot.length > 0 ? (
          <ul>
            {result.loot.map((loot) => (
              <li key={`${loot.itemId}-${loot.quantity}`}>
                {loot.itemName} x{loot.quantity} ({loot.rarity})
              </li>
            ))}
          </ul>
        ) : (
          <p>No loot.</p>
        )}
      </div>

      <div className="result-section">
        <h3>Logs</h3>
        <ul>
          {result.logs.map((log) => (
            <li key={log}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
