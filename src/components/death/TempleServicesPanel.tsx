import { blessings, getBlessingById } from "../../data/blessings";
import type { Character, Guild } from "../../shared/types";

interface TempleServicesPanelProps {
  character: Character;
  guild: Guild;
  onBuyBlessing: (blessingId: string) => void;
}

export function TempleServicesPanel({
  character,
  guild,
  onBuyBlessing,
}: TempleServicesPanelProps) {
  const activeBlessing = getBlessingById(character.blessings?.[0]);

  return (
    <div className="temple-services">
      <div className="temple-services-summary">
        <div>
          <span>Bless atual</span>
          <strong>{activeBlessing?.name ?? "Nenhuma"}</strong>
        </div>
        <div>
          <span>Gold da guilda</span>
          <strong>{guild.gold.toLocaleString("en-US")}g</strong>
        </div>
      </div>

      <div className="blessing-list">
        {blessings.map((blessing) => {
          const hasBlessing = Boolean(activeBlessing);
          const canBuy =
            character.status !== "dead" &&
            !hasBlessing &&
            guild.gold >= blessing.price;

          return (
            <div className="blessing-row" key={blessing.id}>
              <div>
                <strong>{blessing.name}</strong>
                <span>
                  {blessing.description} Custa {blessing.price.toLocaleString("en-US")}g.
                </span>
              </div>
              <button
                disabled={!canBuy}
                onClick={() => onBuyBlessing(blessing.id)}
                type="button"
              >
                Comprar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
