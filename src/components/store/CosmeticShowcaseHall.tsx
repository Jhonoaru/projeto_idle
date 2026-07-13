import { useEffect, useMemo, useState } from "react";
import { collectionItems } from "../../data/collections";
import { isCollectionItemUnlocked } from "../../game-engine/collections/isCollectionItemUnlocked";
import { normalizeCollectionsState } from "../../game-engine/collections/normalizeCollectionsState";
import type {
  Character,
  CollectionCategory,
  CollectionItem,
  CollectionUnlockSource,
  Guild,
} from "../../shared/types";

interface CosmeticShowcaseHallProps {
  character: Character;
  guild: Guild;
  onOpenCollections: () => void;
}

type CategoryFilter = "all" | CollectionCategory;
type SourceFilter = "all" | "earnable" | "future";

const categories: Array<{ id: CategoryFilter; label: string; code: string }> = [
  { id: "all", label: "All Records", code: "ALL" },
  { id: "outfit", label: "Outfits", code: "OF" },
  { id: "mount", label: "Mounts", code: "MT" },
  { id: "avatar", label: "Avatars", code: "AV" },
];

const futureSources: CollectionUnlockSource[] = ["store_placeholder", "event_placeholder"];

export function CosmeticShowcaseHall({ character, guild, onOpenCollections }: CosmeticShowcaseHallProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [selectedItemId, setSelectedItemId] = useState("outfit-noble-adventurer");
  const collections = normalizeCollectionsState(guild.collections);
  const showcaseItems = useMemo(
    () => collectionItems.filter((item) => item.unlockSource !== "starter"),
    [],
  );
  const visibleItems = useMemo(() => showcaseItems.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    const future = futureSources.includes(item.unlockSource);
    const matchesSource = source === "all" || (source === "future" ? future : !future);
    return matchesCategory && matchesSource;
  }), [category, showcaseItems, source]);
  const selectedItem = showcaseItems.find((item) => item.id === selectedItemId) ?? visibleItems[0];
  const selectedUnlocked = selectedItem ? isCollectionItemUnlocked(collections, selectedItem.id) : false;
  const selectedFuture = selectedItem ? futureSources.includes(selectedItem.unlockSource) : false;
  const selectedVocationAllowed = selectedItem
    ? !selectedItem.allowedVocations || selectedItem.allowedVocations.includes(character.vocation)
    : true;
  const unlockedShowcaseCount = showcaseItems.filter((item) => isCollectionItemUnlocked(collections, item.id)).length;
  const futureCount = showcaseItems.filter((item) => futureSources.includes(item.unlockSource)).length;

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
          <span>Local cosmetic showcase</span>
          <h3>{guild.name} Preview Archive</h3>
          <p>Inspect cosmetic records without payments, premium currency or online services.</p>
        </div>
        <div className="store-hall-summary">
          <SummaryStat label="Showcase records" value={`${showcaseItems.length}`} />
          <SummaryStat label="Unlocked" value={`${unlockedShowcaseCount}`} />
          <SummaryStat label="Future previews" value={`${futureCount}`} />
          <SummaryStat label="Purchases" value="Disabled" tone="disabled" />
        </div>
      </section>

      <div className="store-safety-banner">
        <span>Preview-only archive</span>
        <strong>No item can be purchased here. Gameplay unlocks continue through Collections.</strong>
        <button onClick={onOpenCollections} type="button">Open Collections</button>
      </div>

      <nav className="store-category-tabs" aria-label="Cosmetic category">
        {categories.map((entry) => (
          <button
            className={category === entry.id ? "is-active" : ""}
            key={entry.id}
            onClick={() => setCategory(entry.id)}
            type="button"
          >
            <span>{entry.code}</span>
            <strong>{entry.label}</strong>
            <small>{getCategoryCount(showcaseItems, entry.id)} records</small>
          </button>
        ))}
      </nav>

      <div className="store-hall-workspace">
        <section className="store-catalog">
          <header className="store-section-heading">
            <div><span>Showcase catalog</span><h3>Cosmetic Records</h3></div>
            <strong>{visibleItems.length}/{showcaseItems.length} visible</strong>
          </header>

          <div className="store-catalog-toolbar">
            <span>Unlock source</span>
            <div>
              {(["all", "earnable", "future"] as SourceFilter[]).map((filter) => (
                <button
                  className={source === filter ? "is-selected" : ""}
                  key={filter}
                  onClick={() => setSource(filter)}
                  type="button"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="store-card-grid">
            {visibleItems.map((item) => {
              const unlocked = isCollectionItemUnlocked(collections, item.id);
              const future = futureSources.includes(item.unlockSource);
              return (
                <button
                  className={`store-catalog-card rarity-${item.rarity} ${selectedItem?.id === item.id ? "is-selected" : ""} ${unlocked ? "is-unlocked" : ""}`}
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  type="button"
                >
                  <PreviewSigil item={item} />
                  <span>
                    <small>{formatCategory(item.category)} / {formatSource(item.unlockSource)}</small>
                    <strong>{item.name}</strong>
                    <em>{unlocked ? "Unlocked" : future ? "Preview only" : "Gameplay unlock"}</em>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="store-showcase">
          <header className="store-section-heading">
            <div><span>Selected preview</span><h3>{selectedItem?.name ?? "No record"}</h3></div>
            <strong>{selectedItem?.rarity ?? "-"}</strong>
          </header>

          {selectedItem ? (
            <>
              <div className={`store-showcase-stage is-${selectedItem.category} rarity-${selectedItem.rarity}`}>
                <i />
                <PreviewSigil item={selectedItem} large />
                <span>{formatCategory(selectedItem.category)}</span>
              </div>
              <div className="store-showcase-copy">
                <span>{formatSource(selectedItem.unlockSource)} / {selectedItem.rarity}</span>
                <h4>{selectedItem.name}</h4>
                <p>{selectedItem.description}</p>
              </div>
              <div className="store-showcase-stats">
                <SummaryStat label="Collection state" value={selectedUnlocked ? "Unlocked" : "Locked"} />
                <SummaryStat label="Character" value={selectedVocationAllowed ? "Compatible" : "Different vocation"} />
                <SummaryStat label="Access" value={selectedFuture ? "Preview only" : "Gameplay source"} />
                <SummaryStat label="Payment" value="Not available" />
              </div>
              <div className={`store-access-record ${selectedUnlocked ? "is-unlocked" : selectedFuture ? "is-future" : ""}`}>
                <span>{selectedUnlocked ? "Collection record" : selectedFuture ? "Future concept" : "Unlock requirement"}</span>
                <strong>{getAccessMessage(selectedItem, selectedUnlocked)}</strong>
              </div>
              <button className="store-collections-command" onClick={onOpenCollections} type="button">
                Open Collections Hall
              </button>
            </>
          ) : (
            <div className="store-empty">No cosmetic record matches this filter.</div>
          )}
        </aside>
      </div>

      <section className="store-policy-ledger">
        <header className="store-section-heading">
          <div><span>Archive policy</span><h3>Local-Only Showcase</h3></div>
          <strong>No monetization</strong>
        </header>
        <div>
          <PolicyEntry code="01" title="No payment" text="No cards, checkout, paid currency or real-money transactions." />
          <PolicyEntry code="02" title="No power" text="Cosmetics do not add attack, defense, XP or loot bonuses." />
          <PolicyEntry code="03" title="No online" text="The archive reads only the current local guild save." />
          <PolicyEntry code="04" title="Collections owns unlocks" text="Equip and unlock state remain inside the existing Collections system." />
        </div>
      </section>
    </div>
  );
}

function PreviewSigil({ item, large = false }: { item: CollectionItem; large?: boolean }) {
  return <i className={`store-preview-sigil is-${item.category} ${large ? "is-large" : ""}`}>{item.previewValue}</i>;
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return <div className={tone ? `is-${tone}` : undefined}><span>{label}</span><strong>{value}</strong></div>;
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
  if (source === "store_placeholder") return "Future store";
  if (source === "event_placeholder") return "Future event";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function getAccessMessage(item: CollectionItem, unlocked: boolean) {
  if (unlocked) return "Already available in the guild Collections Hall.";
  return item.unlockRequirementText ?? "This record is not currently available.";
}
