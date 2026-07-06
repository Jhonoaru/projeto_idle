import { Panel } from "../ui/Panel";
import { ItemIcon } from "../items/ItemIcon";
import type { Character, HuntArea, HuntSimulationResult } from "../../shared/types";

interface HuntResultPanelProps {
  characterName?: string;
  character?: Character;
  hunt?: HuntArea;
  result?: HuntSimulationResult;
  onOpenInventory?: () => void;
  onOpenQuickSell?: () => void;
}

export function HuntResultPanel({
  characterName,
  character,
  hunt,
  result,
  onOpenInventory,
  onOpenQuickSell,
}: HuntResultPanelProps) {
  if (!result || !hunt || !characterName) {
    return null;
  }

  return (
    <Panel title="Last Hunt Result">
      <div className="hunt-result-panel">
        <div className="result-title-row">
          <strong>{characterName}</strong>
          <span>{hunt.name}</span>
          <em>{result.died ? "Died" : "Survived"}</em>
        </div>

        <div className="result-grid">
          <ResultStat label="Duration" value={`${result.durationMinutes} min`} />
          <ResultStat label="Kills" value={result.killedMonsters.toLocaleString("en-US")} />
          <ResultStat label="XP" value={result.experienceGained.toLocaleString("en-US")} />
          <ResultStat label="Gold" value={result.goldGained.toLocaleString("en-US")} />
          <ResultStat label="Supplies" value={result.supplyValueUsed.toLocaleString("en-US")} />
          <ResultStat label="Net" value={result.netProfit.toLocaleString("en-US")} />
          <ResultStat label="Loot Value" value={result.totalLootValue.toLocaleString("en-US")} />
          <ResultStat label="Loot Weight" value={`${result.totalLootWeight.toFixed(2)} cap`} />
          {character ? (
            <ResultStat
              label="Capacity"
              value={`${character.capacityUsed.toFixed(2)} / ${character.capacityMax.toFixed(0)}`}
            />
          ) : null}
        </div>

        <div className="hunt-action-buttons">
          <button onClick={onOpenInventory} type="button">
            Open Inventory
          </button>
          <button disabled={!result.lootItems.length} onClick={onOpenQuickSell} type="button">
            Quick Sell Loot
          </button>
        </div>

        <div className="result-section">
          <h3>Bestiary Kills</h3>
          {result.monsterKills && result.monsterKills.length > 0 ? (
            <ul>
              {result.monsterKills.map((entry) => (
                <li key={entry.monsterId}>
                  {entry.monsterName}: +{entry.kills.toLocaleString("en-US")}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma kill registrada.</p>
          )}
        </div>

        {result.charmBonusesApplied && result.charmBonusesApplied.length > 0 ? (
          <div className="result-section">
            <h3>Charm Bonuses</h3>
            <ul>
              {result.charmBonusesApplied.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {result.monsterFocusBonusesApplied && result.monsterFocusBonusesApplied.length > 0 ? (
          <div className="result-section">
            <h3>Monster Focus</h3>
            <ul>
              {result.monsterFocusBonusesApplied.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {result.bestiaryLogs && result.bestiaryLogs.length > 0 ? (
          <div className="result-section">
            <h3>Bestiary Updates</h3>
            <ul>
              {result.bestiaryLogs.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="result-section">
          <h3>Supplies Usados</h3>
          {result.suppliesUsed.length > 0 ? (
            <div className="loot-result-grid">
              {result.suppliesUsed.map((supply) => (
                <div className="loot-result-card is-supply" key={supply.itemId}>
                  <ItemIcon item={{ id: supply.itemId, name: supply.itemName, type: "consumable", rarity: "common", weight: 0, value: 0, stackable: true, description: supply.itemName }} quantity={supply.quantityUsed} />
                  <strong>{supply.itemName}</strong>
                  <span>x{supply.quantityUsed}</span>
                  <em>-{supply.valueUsed.toLocaleString("en-US")}g</em>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhum supply consumido.</p>
          )}
        </div>

        {result.missingSupplies && result.missingSupplies.length > 0 ? (
          <div className="result-section">
            <h3>Warnings de Supply</h3>
            <ul>
              {result.missingSupplies.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="result-section">
          <h3>Loot Coletado</h3>
          {result.lootItems.length > 0 ? (
            <div className="loot-result-grid">
              {result.lootItems.map((item) => (
                <div className={`loot-result-card rarity-${item.rarity}`} key={item.itemId}>
                  <ItemIcon item={item.item} quantity={item.quantity} />
                  <strong>{item.itemName}</strong>
                  <span>x{item.quantity} / {item.weightTotal.toFixed(2)} cap</span>
                  <em>{item.totalValue.toLocaleString("en-US")}g</em>
                </div>
              ))}
            </div>
          ) : (
            <p>No notable loot.</p>
          )}
        </div>

        {result.rejectedLoot && result.rejectedLoot.length > 0 ? (
          <div className="result-section">
            <h3>Perdido por Capacity</h3>
            <div className="loot-result-grid">
              {result.rejectedLoot.map((item) => (
                <div className={`loot-result-card is-rejected rarity-${item.rarity}`} key={item.itemId}>
                  <ItemIcon item={item.item} quantity={item.quantity} />
                  <strong>{item.itemName}</strong>
                  <span>x{item.quantity}</span>
                  <em>{item.weightTotal.toFixed(2)} cap</em>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="result-section">
          <h3>Skill Progress</h3>
          <ul>
            {Object.entries(result.skillProgress).map(([skill, progress]) => (
              <li key={skill}>
                {skill}: +{progress}%
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
