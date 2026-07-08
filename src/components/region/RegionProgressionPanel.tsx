import { useMemo, useState } from "react";
import {
  buildRegionProgression,
  type RegionProgression,
  type RegionProgressionItem,
} from "../../game-engine/region-progression/buildRegionProgression";
import type { Boss, Character, HuntArea, Quest } from "../../shared/types";

interface RegionProgressionPanelProps {
  character: Character;
  hunts: HuntArea[];
  quests: Quest[];
  bosses: Boss[];
}

export function RegionProgressionPanel({
  character,
  hunts,
  quests,
  bosses,
}: RegionProgressionPanelProps) {
  const regions = useMemo(
    () => buildRegionProgression(character, hunts, quests, bosses),
    [bosses, character, hunts, quests],
  );
  const [selectedCity, setSelectedCity] = useState(regions[0]?.city ?? character.city);
  const selectedRegion =
    regions.find((region) => region.city === selectedCity) ?? regions[0];
  const nextItem = selectedRegion?.nextItem ?? regions.flatMap((region) => region.items).find(
    (item) => item.status === "available" || item.status === "active" || item.status === "locked",
  );

  if (!selectedRegion) {
    return <div className="empty-list">No region data available.</div>;
  }

  return (
    <div className="region-window">
      <section className="region-hero">
        <div>
          <span>Atlas de progresso</span>
          <strong>{character.name} / {character.city}</strong>
          <p>Rotas, acessos, hunts, quests e bosses calculados a partir do save atual.</p>
        </div>
        <div className="region-hero-meter">
          <span>Regiao atual</span>
          <strong>{selectedRegion.progressPercent}%</strong>
          <i aria-hidden="true"><b style={{ width: `${selectedRegion.progressPercent}%` }} /></i>
        </div>
      </section>

      <section className="region-layout">
        <div className="region-list" aria-label="Regions">
          {regions.map((region) => (
            <button
              className={region.city === selectedRegion.city ? "is-selected" : ""}
              key={region.city}
              onClick={() => setSelectedCity(region.city)}
              type="button"
            >
              <span>{region.levelRange}</span>
              <strong>{region.city}</strong>
              <em>{region.completedCount}/{region.totalCount}</em>
              <i aria-hidden="true"><b style={{ width: `${region.progressPercent}%` }} /></i>
            </button>
          ))}
        </div>

        <div className="region-detail">
          <header className="region-detail-header">
            <div>
              <span>{selectedRegion.levelRange}</span>
              <h3>{selectedRegion.city}</h3>
              <p>{selectedRegion.unlockedCount} desbloqueado(s) de {selectedRegion.totalCount} marco(s).</p>
            </div>
            <div>
              <span>Access keys</span>
              <strong>{selectedRegion.accessKeys.length}</strong>
            </div>
          </header>

          {nextItem ? <NextUnlockCard item={nextItem} /> : null}

          <div className="region-items">
            {selectedRegion.items.map((item) => (
              <RegionItemCard item={item} key={`${item.kind}-${item.id}`} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function NextUnlockCard({ item }: { item: RegionProgressionItem }) {
  return (
    <article className={`region-next region-status-${item.status}`}>
      <span>Proximo marco</span>
      <strong>{item.name}</strong>
      <p>{item.blockerText ?? item.unlockText ?? item.description}</p>
    </article>
  );
}

function RegionItemCard({ item }: { item: RegionProgressionItem }) {
  return (
    <article className={`region-item region-status-${item.status}`}>
      <div className="region-item-icon" aria-hidden="true">
        {getKindIcon(item.kind)}
      </div>
      <div>
        <span>{formatKind(item.kind)} / Lv {item.requiredLevel}</span>
        <strong>{item.name}</strong>
        <p>{item.description}</p>
        <div className="region-item-tags">
          {item.risk ? <em>{item.risk}</em> : null}
          {item.tags.slice(0, 3).map((tag) => <em key={tag}>{tag}</em>)}
        </div>
      </div>
      <div className="region-item-status">
        <strong>{formatStatus(item.status)}</strong>
        <span>{item.blockerText ?? item.unlockText ?? "Ready"}</span>
      </div>
    </article>
  );
}

function getKindIcon(kind: RegionProgressionItem["kind"]) {
  if (kind === "hunt") return "H";
  if (kind === "quest") return "Q";
  if (kind === "boss") return "B";
  return "A";
}

function formatKind(kind: RegionProgressionItem["kind"]) {
  if (kind === "hunt") return "Hunt";
  if (kind === "quest") return "Quest";
  if (kind === "boss") return "Boss";
  return "Access";
}

function formatStatus(status: RegionProgressionItem["status"]) {
  if (status === "completed") return "Unlocked";
  if (status === "active") return "In progress";
  if (status === "available") return "Available";
  return "Locked";
}
