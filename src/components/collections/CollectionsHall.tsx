import { useEffect, useMemo, useState } from "react";
import { collectionItems, getCollectionItemsByCategory } from "../../data/collections";
import { getActiveCharacterCosmetics } from "../../game-engine/collections/getActiveCharacterCosmetics";
import { isCollectionItemUnlocked } from "../../game-engine/collections/isCollectionItemUnlocked";
import { normalizeCollectionsState } from "../../game-engine/collections/normalizeCollectionsState";
import type { Character, CollectionCategory, CollectionItem, CollectionUnlockSource, Guild } from "../../shared/types";

interface CollectionsHallProps {
  character: Character;
  guild: Guild;
  onEquip: (itemId: string) => void;
  onMarkSeen: () => void;
}

type CollectionFilter = "all" | "unlocked" | "locked";

const categories: CollectionCategory[] = ["outfit", "mount", "avatar"];

export function CollectionsHall({ character, guild, onEquip, onMarkSeen }: CollectionsHallProps) {
  const [activeCategory, setActiveCategory] = useState<CollectionCategory>("outfit");
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const collections = normalizeCollectionsState(guild.collections);
  const activeCosmetics = getActiveCharacterCosmetics(character, collections);
  const newCount = collections.newlyUnlockedCollectionItemIds.length;
  const categoryItems = useMemo(() => getCollectionItemsByCategory(activeCategory), [activeCategory]);
  const initialItem = getInitialItem(categoryItems, activeCosmetics.cosmetics, activeCategory, collections.unlockedCollectionItemIds);
  const [selectedItemId, setSelectedItemId] = useState(initialItem?.id ?? "");
  const filteredItems = categoryItems.filter((item) => {
    const unlocked = isCollectionItemUnlocked(collections, item.id);
    const matchesFilter = activeFilter === "all" || (activeFilter === "unlocked" ? unlocked : !unlocked);
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || `${item.name} ${item.description} ${item.unlockSource}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  const selectedItem = categoryItems.find((item) => item.id === selectedItemId) ?? initialItem;
  const selectedUnlocked = selectedItem ? isCollectionItemUnlocked(collections, selectedItem.id) : false;
  const selectedEquipped = selectedItem ? isCosmeticEquipped(activeCosmetics.cosmetics, selectedItem.id) : false;
  const selectedVocationAllowed = selectedItem
    ? !selectedItem.allowedVocations || selectedItem.allowedVocations.includes(character.vocation)
    : false;
  const totalUnlocked = collectionItems.filter((item) => isCollectionItemUnlocked(collections, item.id)).length;
  const completionPercent = Math.round((totalUnlocked / Math.max(1, collectionItems.length)) * 100);

  useEffect(() => {
    if (newCount > 0) onMarkSeen();
  }, [newCount, onMarkSeen]);

  useEffect(() => {
    if (!categoryItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(getInitialItem(categoryItems, activeCosmetics.cosmetics, activeCategory, collections.unlockedCollectionItemIds)?.id ?? "");
    }
  }, [activeCategory, activeCosmetics.cosmetics, categoryItems, collections.unlockedCollectionItemIds, selectedItemId]);

  useEffect(() => {
    if (filteredItems.length > 0 && !filteredItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(filteredItems[0]?.id ?? "");
    }
  }, [activeCategory, activeFilter, searchTerm]);

  return (
    <div className="collections-hall">
      <section className="collections-hall-hero">
        <div className="collections-hall-seal" aria-hidden="true"><i /><span>C</span></div>
        <div className="collections-hall-identity">
          <span>Guild cosmetic archive</span>
          <h3>{guild.name} Wardrobe Hall</h3>
          <p>{character.name} / {character.vocation} / Personal loadout</p>
        </div>
        <div className="collections-hall-summary">
          <SummaryStat label="Unlocked" value={`${totalUnlocked}/${collectionItems.length}`} />
          <SummaryStat label="Completion" value={`${completionPercent}%`} />
          <SummaryStat label="New records" value={`${newCount}`} />
          <SummaryStat label="Active set" value="3 slots" />
        </div>
      </section>

      <nav className="collections-hall-tabs" aria-label="Collection categories">
        {categories.map((category) => {
          const items = getCollectionItemsByCategory(category);
          const unlocked = items.filter((item) => isCollectionItemUnlocked(collections, item.id)).length;
          return (
            <button className={activeCategory === category ? "is-active" : ""} key={category} onClick={() => setActiveCategory(category)} type="button">
              <span>{getCategorySigil(category)}</span>
              <strong>{formatCollectionCategory(category)}</strong>
              <small>{unlocked}/{items.length} collected</small>
            </button>
          );
        })}
      </nav>

      <div className="collections-hall-workspace">
        <section className="collections-catalog">
          <SectionHeading eyebrow="Collection records" title={`${formatCollectionCategory(activeCategory)} Catalog`} value={`${filteredItems.length} shown`} />
          <div className="collections-catalog-toolbar">
            <input aria-label="Search collection" onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search cosmetic..." type="search" value={searchTerm} />
            <div className="collections-filter-group">
              {(["all", "unlocked", "locked"] as CollectionFilter[]).map((filter) => (
                <button className={activeFilter === filter ? "is-selected" : ""} key={filter} onClick={() => setActiveFilter(filter)} type="button">{filter}</button>
              ))}
            </div>
          </div>

          <div className="collections-card-grid">
            {filteredItems.length > 0 ? filteredItems.map((item) => {
              const unlocked = isCollectionItemUnlocked(collections, item.id);
              const equipped = isCosmeticEquipped(activeCosmetics.cosmetics, item.id);
              const isNew = collections.newlyUnlockedCollectionItemIds.includes(item.id);
              return (
                <button
                  className={`collections-catalog-card rarity-${item.rarity} ${unlocked ? "is-unlocked" : "is-locked"} ${equipped ? "is-equipped" : ""} ${selectedItem?.id === item.id ? "is-selected" : ""}`.trim()}
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  type="button"
                >
                  <span className={`collections-card-preview is-${item.category}`}>{unlocked ? item.previewValue : "?"}</span>
                  <span className="collections-card-copy">
                    <small>{item.rarity} / {formatUnlockSource(item.unlockSource)}</small>
                    <strong>{item.name}</strong>
                    <em>{equipped ? "Equipped" : isNew ? "New" : unlocked ? "Unlocked" : "Locked"}</em>
                  </span>
                </button>
              );
            }) : <div className="collections-empty-state"><strong>No cosmetics found</strong><span>Change the search or collection filter.</span></div>}
          </div>
        </section>

        <aside className="collections-showcase">
          <SectionHeading eyebrow="Selected record" title="Cosmetic Showcase" value={selectedItem ? selectedItem.rarity : "No selection"} />
          {selectedItem ? (
            <>
              <div className={`collections-showcase-preview is-${selectedItem.category} rarity-${selectedItem.rarity}`}>
                <i /><span>{selectedUnlocked ? selectedItem.previewValue : "?"}</span>
              </div>
              <div className="collections-showcase-copy">
                <span>{formatCollectionCategory(selectedItem.category)} / {formatUnlockSource(selectedItem.unlockSource)}</span>
                <h3>{selectedItem.name}</h3>
                <p>{selectedItem.description}</p>
              </div>
              <div className="collections-showcase-stats">
                <ShowcaseStat label="Status" value={selectedEquipped ? "Equipped" : selectedUnlocked ? "Unlocked" : "Locked"} />
                <ShowcaseStat label="Rarity" value={selectedItem.rarity} />
                <ShowcaseStat label="Source" value={formatUnlockSource(selectedItem.unlockSource)} />
                <ShowcaseStat label="Vocation" value={selectedItem.allowedVocations?.join(", ") ?? "All vocations"} />
              </div>
              <div className="collections-unlock-record">
                <span>Unlock record</span>
                <strong>{selectedUnlocked ? "Registered in the guild archive." : selectedItem.unlockRequirementText ?? "Future local unlock."}</strong>
              </div>
              <button
                className="collections-equip-command"
                disabled={!selectedUnlocked || selectedEquipped || !selectedVocationAllowed}
                onClick={() => onEquip(selectedItem.id)}
                type="button"
              >
                {selectedEquipped ? "Currently equipped" : !selectedUnlocked ? "Collection locked" : !selectedVocationAllowed ? "Different vocation" : `Equip ${formatCollectionCategory(selectedItem.category).slice(0, -1)}`}
              </button>
            </>
          ) : <div className="collections-empty-state">No cosmetic selected.</div>}
        </aside>
      </div>

      <section className="collections-loadout">
        <SectionHeading eyebrow="Character appearance" title={`${character.name}'s Active Loadout`} value={character.vocation} />
        <div className="collections-loadout-grid">
          <LoadoutSlot category="outfit" item={activeCosmetics.outfit} />
          <LoadoutSlot category="mount" item={activeCosmetics.mount} />
          <LoadoutSlot category="avatar" item={activeCosmetics.avatar} />
        </div>
      </section>
    </div>
  );
}

function getInitialItem(
  items: CollectionItem[],
  cosmetics: ReturnType<typeof getActiveCharacterCosmetics>["cosmetics"],
  category: CollectionCategory,
  unlockedIds: string[],
) {
  const equippedId = category === "outfit" ? cosmetics.activeOutfitId : category === "mount" ? cosmetics.activeMountId : cosmetics.activeAvatarId;
  return items.find((item) => item.id === equippedId) ?? items.find((item) => unlockedIds.includes(item.id)) ?? items[0];
}

function isCosmeticEquipped(cosmetics: ReturnType<typeof getActiveCharacterCosmetics>["cosmetics"], itemId: string) {
  return cosmetics.activeOutfitId === itemId || cosmetics.activeMountId === itemId || cosmetics.activeAvatarId === itemId;
}

function formatCollectionCategory(category: CollectionCategory) {
  if (category === "outfit") return "Outfits";
  if (category === "mount") return "Mounts";
  return "Avatars";
}

function formatUnlockSource(source: CollectionUnlockSource) {
  if (source === "store_placeholder") return "future store";
  if (source === "event_placeholder") return "future event";
  return source;
}

function getCategorySigil(category: CollectionCategory) {
  if (category === "outfit") return "OF";
  if (category === "mount") return "MT";
  return "AV";
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function SectionHeading({ eyebrow, title, value }: { eyebrow: string; title: string; value: string }) {
  return <header className="collections-section-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div><strong>{value}</strong></header>;
}

function ShowcaseStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function LoadoutSlot({ category, item }: { category: CollectionCategory; item?: CollectionItem }) {
  return (
    <div className={`collections-loadout-slot is-${category}`}>
      <span>{item?.previewValue ?? getCategorySigil(category)}</span>
      <div><small>{formatCollectionCategory(category).slice(0, -1)}</small><strong>{item?.name ?? "None"}</strong><em>{item?.rarity ?? "empty"}</em></div>
    </div>
  );
}
