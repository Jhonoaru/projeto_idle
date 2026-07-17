import { useEffect, useMemo, useState } from "react";
import { collectionItems } from "../../data/collections";
import {
  cosmeticExchanges,
  formatCosmeticExchangeCost,
  getCosmeticExchange,
} from "../../data/cosmeticExchanges";
import { quests } from "../../data/quests";
import { isCollectionItemUnlocked } from "../../game-engine/collections/isCollectionItemUnlocked";
import { normalizeCollectionsState } from "../../game-engine/collections/normalizeCollectionsState";
import { getCosmeticExchangeAvailability } from "../../game-engine/cosmetic-exchange/getCosmeticExchangeAvailability";
import type {
  Character,
  CollectionCategory,
  CollectionItem,
  CollectionUnlockSource,
  Guild,
  GuildDepot,
} from "../../shared/types";

interface CosmeticShowcaseHallProps {
  character: Character;
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  onExchangeCosmetic: (collectionItemId: string) => void;
  onOpenCollections: () => void;
}

type CategoryFilter = "all" | CollectionCategory;
type SourceFilter = "all" | "exchange" | "gameplay";

const categories: Array<{ id: CategoryFilter; label: string; code: string }> = [
  { id: "all", label: "All Records", code: "ALL" },
  { id: "outfit", label: "Outfits", code: "OF" },
  { id: "mount", label: "Mounts", code: "MT" },
  { id: "avatar", label: "Avatars", code: "AV" },
];

export function CosmeticShowcaseHall({
  character,
  characters,
  depot,
  guild,
  onExchangeCosmetic,
  onOpenCollections,
}: CosmeticShowcaseHallProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [selectedItemId, setSelectedItemId] = useState("outfit-noble-adventurer");
  const collections = normalizeCollectionsState(guild.collections);
  const showcaseItems = useMemo(() => collectionItems.filter((item) => item.unlockSource !== "starter"), []);
  const visibleItems = useMemo(() => showcaseItems.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const exchange = Boolean(getCosmeticExchange(item.id));
    const matchesSource = source === "all" || (source === "exchange" ? exchange : !exchange);
    return matchesCategory && matchesSource;
  }), [category, showcaseItems, source]);
  const selectedItem = showcaseItems.find((item) => item.id === selectedItemId) ?? visibleItems[0];
  const selectedUnlocked = selectedItem ? isCollectionItemUnlocked(collections, selectedItem.id) : false;
  const selectedExchange = getCosmeticExchange(selectedItem?.id);
  const selectedAvailability = selectedExchange
    ? getCosmeticExchangeAvailability(selectedExchange, guild, depot, characters)
    : undefined;
  const selectedVocationAllowed = selectedItem
    ? !selectedItem.allowedVocations || selectedItem.allowedVocations.includes(character.vocation)
    : true;
  const unlockedShowcaseCount = showcaseItems.filter((item) => isCollectionItemUnlocked(collections, item.id)).length;

  useEffect(() => {
    if (visibleItems.length > 0 && !visibleItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(visibleItems[0].id);
    }
  }, [category, selectedItemId, source, visibleItems]);

  return (
    <div className="store-hall">
      <section className="store-hall-hero">
        <div className="store-hall-seal" aria-hidden="true"><i /><span>S</span></div>
        <div className="store-hall-identity">
          <span>Guild wardrobe exchange</span>
          <h3>{guild.name} Wardrobe Exchange</h3>
          <p>Trade local guild gold, boss trophies and quest materials for permanent cosmetic records.</p>
        </div>
        <div className="store-hall-summary">
          <SummaryStat label="Showcase records" value={`${showcaseItems.length}`} />
          <SummaryStat label="Unlocked" value={`${unlockedShowcaseCount}`} />
          <SummaryStat label="Exchange records" value={`${cosmeticExchanges.length}`} />
          <SummaryStat label="Acquisition" value="Local exchange" />
        </div>
      </section>

      <div className="store-safety-banner">
        <span>Cosmetic progression</span>
        <strong>Guild appearances live in Collections and never add combat power.</strong>
        <button onClick={onOpenCollections} type="button">Open Collections</button>
      </div>

      <nav className="store-category-tabs" aria-label="Cosmetic category">
        {categories.map((entry) => (
          <button className={category === entry.id ? "is-active" : ""} key={entry.id} onClick={() => setCategory(entry.id)} type="button">
            <span>{entry.code}</span><strong>{entry.label}</strong><small>{getCategoryCount(showcaseItems, entry.id)} records</small>
          </button>
        ))}
      </nav>

      <div className="store-hall-workspace">
        <section className="store-catalog">
          <header className="store-section-heading">
            <div><span>Wardrobe catalog</span><h3>Cosmetic Records</h3></div>
            <strong>{visibleItems.length}/{showcaseItems.length} visible</strong>
          </header>
          <div className="store-catalog-toolbar">
            <span>Acquisition</span>
            <div>
              {(["all", "exchange", "gameplay"] as SourceFilter[]).map((filter) => (
                <button className={source === filter ? "is-selected" : ""} key={filter} onClick={() => setSource(filter)} type="button">{filter}</button>
              ))}
            </div>
          </div>
          <div className="store-card-grid">
            {visibleItems.map((item) => {
              const unlocked = isCollectionItemUnlocked(collections, item.id);
              const exchange = getCosmeticExchange(item.id);
              return (
                <button
                  className={`store-catalog-card rarity-${item.rarity} ${selectedItem?.id === item.id ? "is-selected" : ""} ${unlocked ? "is-unlocked" : ""}`}
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  type="button"
                >
                  <PreviewSigil item={item} />
                  <span>
                    <small>{formatCategory(item.category)} / {exchange ? "Wardrobe exchange" : formatSource(item.unlockSource)}</small>
                    <strong>{item.name}</strong>
                    <em>{unlocked ? "Unlocked" : exchange ? formatCosmeticExchangeCost(exchange) : "Gameplay unlock"}</em>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="store-showcase">
          <header className="store-section-heading">
            <div><span>Selected record</span><h3>{selectedItem?.name ?? "No record"}</h3></div>
            <strong>{selectedItem?.rarity ?? "-"}</strong>
          </header>
          {selectedItem ? (
            <>
              <div className={`store-showcase-stage is-${selectedItem.category} rarity-${selectedItem.rarity}`}>
                <i /><PreviewSigil item={selectedItem} large /><span>{formatCategory(selectedItem.category)}</span>
              </div>
              <div className="store-showcase-copy">
                <span>{selectedExchange ? "Wardrobe exchange" : formatSource(selectedItem.unlockSource)} / {selectedItem.rarity}</span>
                <h4>{selectedItem.name}</h4><p>{selectedItem.description}</p>
              </div>
              <div className="store-showcase-stats">
                <SummaryStat label="Collection state" value={selectedUnlocked ? "Unlocked" : "Locked"} />
                <SummaryStat label="Character" value={selectedVocationAllowed ? "Compatible" : "Different vocation"} />
                <SummaryStat label="Access" value={selectedExchange ? "Local exchange" : "Gameplay source"} />
                <SummaryStat label="Cost" value={selectedExchange ? formatCosmeticExchangeCost(selectedExchange) : "Gameplay reward"} />
              </div>
              {selectedExchange ? (
                <div className="store-exchange-ledger">
                  {selectedExchange.goldCost > 0 ? (
                    <ResourceRow label="Guild gold" current={Math.max(0, Math.floor(Number(guild.gold) || 0))} required={selectedExchange.goldCost} />
                  ) : null}
                  {selectedAvailability?.materialBalances.map((material) => (
                    <ResourceRow key={material.itemId} label={material.name} current={material.available} required={material.quantity} />
                  ))}
                  {selectedExchange.requiredQuestId ? (
                    <div className={selectedAvailability?.questComplete ? "is-ready" : "is-missing"}>
                      <span>Quest</span><strong>{quests.find((quest) => quest.id === selectedExchange.requiredQuestId)?.name ?? selectedExchange.requiredQuestId}</strong>
                      <em>{selectedAvailability?.questComplete ? "Complete" : "Required"}</em>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className={`store-access-record ${selectedUnlocked ? "is-unlocked" : selectedAvailability?.available ? "is-ready" : ""}`}>
                <span>{selectedUnlocked ? "Collection record" : selectedExchange ? "Exchange status" : "Unlock requirement"}</span>
                <strong>{getAccessMessage(selectedItem, selectedUnlocked, selectedAvailability?.reasons)}</strong>
              </div>
              <div className="store-command-stack">
                {selectedExchange ? (
                  <button
                    className="store-exchange-command"
                    disabled={selectedUnlocked || !selectedAvailability?.available}
                    onClick={() => onExchangeCosmetic(selectedItem.id)}
                    type="button"
                  >
                    {selectedUnlocked ? "Already Unlocked" : "Unlock Cosmetic"}
                  </button>
                ) : null}
                <button className="store-collections-command" onClick={onOpenCollections} type="button">Open Collections Hall</button>
              </div>
            </>
          ) : <div className="store-empty">No cosmetic record matches this filter.</div>}
        </aside>
      </div>

      <section className="store-policy-ledger">
        <header className="store-section-heading">
          <div><span>Wardrobe rules</span><h3>Single-Player Cosmetic Exchange</h3></div><strong>Gameplay-earned</strong>
        </header>
        <div>
          <PolicyEntry code="01" title="Local resources" text="Exchanges use guild gold, boss trophies and quest progress earned in this campaign." />
          <PolicyEntry code="02" title="No power" text="Cosmetics do not add attack, defense, XP or loot bonuses." />
          <PolicyEntry code="03" title="Permanent record" text="Every unlock remains in the existing SQLite guild collection." />
          <PolicyEntry code="04" title="Duplicate-safe" text="Unlocked records cannot consume the same exchange resources twice." />
        </div>
      </section>
    </div>
  );
}

function PreviewSigil({ item, large = false }: { item: CollectionItem; large?: boolean }) {
  return <i className={`store-preview-sigil is-${item.category} ${large ? "is-large" : ""}`}>{item.previewValue}</i>;
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function ResourceRow({ label, current, required }: { label: string; current: number; required: number }) {
  const ready = current >= required;
  return <div className={ready ? "is-ready" : "is-missing"}><span>{label}</span><strong>{current.toLocaleString("en-US")} / {required.toLocaleString("en-US")}</strong><em>{ready ? "Ready" : "Missing"}</em></div>;
}

function PolicyEntry({ code, title, text }: { code: string; title: string; text: string }) {
  return <article><span>{code}</span><div><strong>{title}</strong><p>{text}</p></div></article>;
}

function getCategoryCount(items: CollectionItem[], category: CategoryFilter) {
  return category === "all" ? items.length : items.filter((item) => item.category === category).length;
}

function formatCategory(category: CollectionCategory) {
  if (category === "outfit") return "Outfit";
  if (category === "mount") return "Mount";
  return "Avatar";
}

function formatSource(source: CollectionUnlockSource) {
  if (source === "store_placeholder" || source === "event_placeholder") return "Wardrobe exchange";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function getAccessMessage(item: CollectionItem, unlocked: boolean, reasons?: string[]) {
  if (unlocked) return "Already available in the guild Collections Hall.";
  if (reasons?.length) return reasons.join(" ");
  return item.unlockRequirementText ?? "This record is not currently available.";
}
