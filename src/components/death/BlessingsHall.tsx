import { blessings, getActiveBlessings } from "../../data/blessings";
import { getTempleForCity } from "../../data/temples";
import { calculateBlessingsProtection } from "../../game-engine/death/calculateBlessProtection";
import type { Character, Guild } from "../../shared/types";
import { DeathPanel } from "./DeathPanel";

interface BlessingsHallProps {
  character: Character;
  guild: Guild;
  onBackToCharacter: () => void;
  onBuyBlessing: (blessingId: string) => void;
  onRevive: () => void;
}

export function BlessingsHall({
  character,
  guild,
  onBackToCharacter,
  onBuyBlessing,
  onRevive,
}: BlessingsHallProps) {
  const activeBlessings = getActiveBlessings(character.blessings);
  const activeIds = new Set(activeBlessings.map((blessing) => blessing.id));
  const visibleActiveCount = blessings.filter((blessing) => activeIds.has(blessing.id)).length;
  const protectionPercent = Math.round(calculateBlessingsProtection(activeBlessings) * 100);
  const temple = getTempleForCity(character.city);
  const hasLegacyBlessing = activeBlessings.some((blessing) => blessing.domain === "Legacy");

  return (
    <div className="blessings-hall">
      <section className="blessings-hall-hero">
        <div className="blessings-hall-seal" aria-hidden="true">
          <span>B</span>
          <i />
        </div>

        <div className="blessings-hall-identity">
          <span>Temple protection</span>
          <h3>{character.name}</h3>
          <p>{temple.name} / {character.vocation} / Level {character.level}</p>
          <button onClick={onBackToCharacter} type="button">Character Hall</button>
        </div>

        <div className="blessings-hall-summary">
          <SummaryStat label="Active" value={`${visibleActiveCount}/${blessings.length}`} />
          <SummaryStat label="Death protection" value={`${protectionPercent}%`} />
          <SummaryStat label="Guild gold" value={`${guild.gold.toLocaleString("en-US")}g`} />
        </div>
      </section>

      {character.status === "dead" ? (
        <section className="blessings-hall-death">
          <DeathPanel character={character} onRevive={onRevive} />
        </section>
      ) : null}

      {hasLegacyBlessing ? (
        <div className="blessings-legacy-notice">
          <strong>Legacy protection active</strong>
          <span>{activeBlessings.find((blessing) => blessing.domain === "Legacy")?.name}</span>
        </div>
      ) : null}

      <section className="blessings-hall-board">
        <header>
          <div>
            <span>Temple rites</span>
            <h3>Seven Blessings</h3>
          </div>
          <strong>{protectionPercent}% total protection</strong>
        </header>

        <div className="blessings-card-grid">
          {blessings.map((blessing, index) => {
            const active = activeIds.has(blessing.id);
            const insufficientGold = guild.gold < blessing.price;
            const canBuy =
              character.status !== "dead" &&
              !hasLegacyBlessing &&
              !active &&
              !insufficientGold;

            return (
              <article className={`blessing-card ${active ? "is-active" : ""}`} key={blessing.id}>
                <div className="blessing-card-rank">Blessing {index + 1}</div>
                <div className={`blessing-card-sigil blessing-sigil-${(index % 4) + 1}`}>
                  <span>{blessing.sigil}</span>
                  <i />
                </div>
                <div className="blessing-card-copy">
                  <span>{blessing.domain}</span>
                  <h4>{blessing.name}</h4>
                  <p>{blessing.description}</p>
                </div>
                <div className="blessing-card-protection">
                  <span>Death protection</span>
                  <strong>+{blessing.protectionPercent}%</strong>
                </div>
                <div className="blessing-card-price">
                  <span>G</span>
                  <strong>{blessing.price.toLocaleString("en-US")}</strong>
                </div>
                <button
                  className={active ? "is-owned" : ""}
                  disabled={!canBuy}
                  onClick={() => onBuyBlessing(blessing.id)}
                  type="button"
                >
                  {active
                    ? "Active"
                    : character.status === "dead"
                      ? "Revive first"
                      : hasLegacyBlessing
                        ? "Legacy active"
                        : insufficientGold
                          ? "Insufficient gold"
                          : "Buy blessing"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="blessings-temple-record">
        <header>
          <span>Temple record</span>
          <h3>{temple.name}</h3>
        </header>
        <div>
          <SummaryStat label="Adventurer" value={character.name} />
          <SummaryStat label="Deaths" value={`${character.deathCount ?? 0}`} />
          <SummaryStat label="Current state" value={character.status === "dead" ? "Recovery" : "Protected"} />
          <SummaryStat label="Item loss" value="Disabled" />
        </div>
      </section>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
