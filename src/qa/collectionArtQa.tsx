import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createInitialGameState } from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import { collectionSprites, getCollectionSprite, getMountSprite, getOutfitSprite } from "../data/collectionSprites";
import { normalizeCharacterCosmetics } from "../game-engine/collections/normalizeCharacterCosmetics";
import { HuntSceneActor } from "../components/hunt-scene/HuntSceneActor";
import { getCollectionItemById } from "../data/collections";
import { getBossTrophyRewards } from "../data/bossTrophyRewards";
import { BossTrophyHall } from "../components/boss/BossTrophyHall";
import { CollectionsHall } from "../components/collections/CollectionsHall";
import { CollectionPreview } from "../components/collections/CollectionPreview";
import { CharacterSprite } from "../components/characters/CharacterSprite";
import { RightCharacterPanel } from "../components/layout/RightCharacterPanel";
import { getActiveCharacterCosmetics } from "../game-engine/collections/getActiveCharacterCosmetics";
import { equipCollectionItem } from "../game-engine/collections/equipCollectionItem";
import { clearNewCollectionFlags } from "../game-engine/collections/clearNewCollectionFlags";
import { claimBossTrophyReward } from "../game-engine/boss/claimBossTrophyReward";
import { normalizeGuildOperationOutcomes } from "../game-engine/operations/normalizeGuildOperationOutcomes";
import "../styles.css";

const categoryParam = new URLSearchParams(location.search).get("category");
const category = categoryParam === "outfit" || categoryParam === "mount" ? categoryParam : "avatar";
const rewardIndex = { avatar: 0, outfit: 1, mount: 2 }[category];

// Memory-only fixture: no database connection, persistence or production entrypoint.
function seed() {
  const state = structuredClone(createInitialGameState());
  state.guild.operationOutcomes = normalizeGuildOperationOutcomes({
    bossRaidCodex: { records: bosses.map((boss) => ({ bossId: boss.id, attempts: 1, defeats: 1, lastAttemptAt: "2026-09-03T12:00:00.000Z", lastDefeatedAt: "2026-09-03T12:00:00.000Z" })) },
    ...(category !== "avatar" ? { bossExecutionMastery: { records: bosses.map((boss) => ({ bossId: boss.id, victoriesWithPerfectReactions: category === "mount" ? 6 : 3, totalPerfectReactions: category === "mount" ? 30 : 12, perfectDodges: category === "mount" ? 15 : 6, perfectHolds: category === "mount" ? 15 : 6, bestPerfectChain: category === "mount" ? 6 : 4, lastRecordedAt: "2026-09-03T12:00:00.000Z" })) } } : {}),
  });
  if (category !== "avatar") {
    for (const boss of bosses) {
      state.guild = claimBossTrophyReward(state.guild, getBossTrophyRewards(boss.id)[0].id).guild;
      if (category === "mount") state.guild = claimBossTrophyReward(state.guild, getBossTrophyRewards(boss.id)[1].id).guild;
    }
  }
  if (category === "mount") {
    state.characters[0] = equipCollectionItem(state.characters[0], state.guild, getBossTrophyRewards(bosses[0].id)[1].collectionItemId);
  }
  return state;
}

const originalSprites = structuredClone(collectionSprites);
const artIds = Object.keys(collectionSprites).filter((id) => getCollectionItemById(id)?.category === category);
const checks: string[] = [];
function check(ok: unknown, label: string) {
  if (!ok) throw new Error(label);
  checks.push(label);
}
check(artIds.length === 6, `six original ${category}s`);
check(!getCollectionSprite(undefined) && !getCollectionSprite("missing") && !getCollectionSprite("toString"), "unknown IDs fall back");
for (const boss of bosses) {
  const reward = getBossTrophyRewards(boss.id)[rewardIndex];
  const item = getCollectionItemById(reward.collectionItemId);
  const state = seed();
  const before = JSON.stringify(state);
  check(item?.category === category && !!getCollectionSprite(item.id), `${boss.id}: ${category} mapping`);
  let lockedRejected = false;
  try {
    equipCollectionItem(state.characters[0], state.guild, reward.collectionItemId);
  } catch (error) {
    lockedRejected = error instanceof Error && error.message === "Collection item is locked.";
  }
  check(lockedRejected, `${boss.id}: locked equip rejected`);
  const claim = claimBossTrophyReward(state.guild, reward.id);
  check(claim.success, `${boss.id}: existing claim works`);
  const character = equipCollectionItem(state.characters[0], claim.guild, reward.collectionItemId);
  check(getActiveCharacterCosmetics(character, claim.guild.collections)[category]?.id === reward.collectionItemId, `${boss.id}: equipped ${category} resolves`);
  check(JSON.stringify(state) === before, `${boss.id}: inputs unchanged`);
  check(claim.guild.gold === state.guild.gold && character.attributes === state.characters[0].attributes, `${boss.id}: no power or economy change`);
  if (category !== "avatar") {
    const restored = JSON.parse(JSON.stringify(character));
    const normalized = normalizeCharacterCosmetics(restored, claim.guild.collections);
    const restoredSprite = category === "mount" ? getMountSprite(normalized.activeMountId) : getOutfitSprite(normalized.activeOutfitId);
    check(restoredSprite?.src === getCollectionSprite(reward.collectionItemId)?.src, `${boss.id}: restored appearance resolves`);
    const companionsPreserved = category === "mount"
      ? normalized.activeAvatarId === state.characters[0].cosmetics?.activeAvatarId && normalized.activeOutfitId === state.characters[0].cosmetics?.activeOutfitId
      : normalized.activeAvatarId === state.characters[0].cosmetics?.activeAvatarId && normalized.activeMountId === state.characters[0].cosmetics?.activeMountId;
    check(companionsPreserved, `${boss.id}: other cosmetic slots preserved`);
    check(!claimBossTrophyReward(claim.guild, reward.id).success, `${boss.id}: duplicate rejected`);
  }
}
if (category === "outfit") {
  check(!getOutfitSprite(undefined), "legacy outfit uses base portrait");
  check(!getOutfitSprite("missing"), "invalid outfit uses base portrait");
  check(!getOutfitSprite("avatar-arena-laurel"), "avatar cannot replace outfit");
}
if (category === "mount") {
  check(!getMountSprite(undefined), "legacy mount keeps hero-only portrait");
  check(!getMountSprite("missing"), "invalid mount keeps hero-only portrait");
  check(!getMountSprite("outfit-arena-champion"), "outfit cannot replace mount");
}

function CollectionArtQa() {
  const [state, setState] = useState(seed);
  const [selectedBoss, setSelectedBoss] = useState(bosses[0]);
  const [view, setView] = useState("Gallery");
  const [missing, setMissing] = useState(false);
  const character = state.characters[0];
  const avatar = getActiveCharacterCosmetics(character, state.guild.collections).avatar;
  return (
    <main style={{ maxWidth: 1440, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 20 }}>Stage {{ avatar: "166", outfit: "167", mount: "168" }[category]} - Collection Art QA</h1>
      <p>{checks.length}/{checks.length} deterministic checks passed. Memory-only fixture.</p>
      <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["Gallery", "Trophy Hall", "Collections", "Profile"].map((tab) => <button key={tab} onClick={() => setView(tab)}>{tab}</button>)}
        <label><input type="checkbox" checked={missing} onChange={(event) => {
          const next = event.target.checked;
          for (const id of artIds) collectionSprites[id] = { ...originalSprites[id], src: next ? `/qa/missing/${id}.png` : originalSprites[id].src };
          setMissing(next);
        }} />Simulate unavailable artwork</label>
        <button onClick={() => setState(seed())}>Reset fixture</button>
        <button onClick={() => setState((current) => {
          let guild = current.guild;
          for (const boss of bosses) guild = claimBossTrophyReward(guild, getBossTrophyRewards(boss.id)[rewardIndex].id).guild;
          return { ...current, guild };
        })}>Claim all six {category}s</button>
      </nav>
      <div key={String(missing)}>
        {view === "Gallery" ? <div className="collection-art-qa-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
          {artIds.map((id) => <article key={id}>
            <div className={`collections-showcase-preview is-${category}`} style={{ minHeight: 160 }}>
              <i aria-hidden="true" />
              <span><CollectionPreview item={getCollectionItemById(id)} /></span>
            </div>
            <h2 style={{ fontSize: 14 }}>{getCollectionItemById(id)?.name}</h2>
            <div className={`collections-card-preview is-${category}`}><CollectionPreview item={getCollectionItemById(id)} /></div>
          </article>)}
        </div> : null}
        {view === "Trophy Hall" ? <BossTrophyHall bosses={bosses} guild={state.guild} selectedBoss={selectedBoss} onSelectBoss={setSelectedBoss} onClaimReward={(id) => setState((current) => ({ ...current, guild: claimBossTrophyReward(current.guild, id).guild }))} /> : null}
        {view === "Collections" ? <CollectionsHall character={character} guild={state.guild} onEquip={(id) => setState((current) => ({ ...current, characters: [equipCollectionItem(current.characters[0], current.guild, id), ...current.characters.slice(1)] }))} onMarkSeen={() => setState((current) => ({ ...current, guild: clearNewCollectionFlags(current.guild) }))} /> : null}
        {view === "Profile" ? <>
          <CharacterSprite character={character} avatar={avatar} size="large" />
          <div style={{ position: "relative", height: 300, width: "min(100%, 600px)", background: "#263b37" }}><HuntSceneActor character={character} actionText={`${category} QA`} /></div>
          <div style={{ width: "min(100%, 320px)" }}><RightCharacterPanel character={character} guild={state.guild} logs={[]} /></div>
        </> : null}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<CollectionArtQa />);
