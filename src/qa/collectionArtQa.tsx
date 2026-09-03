import { useState } from "react";
import { createRoot } from "react-dom/client";
import { createInitialGameState } from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import { collectionSprites, getCollectionSprite } from "../data/collectionSprites";
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

// Memory-only fixture: no database connection, persistence or production entrypoint.
function seed() {
  const state = structuredClone(createInitialGameState());
  state.guild.operationOutcomes = normalizeGuildOperationOutcomes({
    bossRaidCodex: { records: bosses.map((boss) => ({ bossId: boss.id, attempts: 1, defeats: 1, lastAttemptAt: "2026-09-03T12:00:00.000Z", lastDefeatedAt: "2026-09-03T12:00:00.000Z" })) },
  });
  return state;
}

const originalSprites = structuredClone(collectionSprites);
const avatarIds = Object.keys(collectionSprites);
const checks: string[] = [];
function check(ok: unknown, label: string) {
  if (!ok) throw new Error(label);
  checks.push(label);
}
check(avatarIds.length === 6, "six original avatars");
check(!getCollectionSprite(undefined) && !getCollectionSprite("missing") && !getCollectionSprite("toString"), "unknown IDs fall back");
for (const boss of bosses) {
  const reward = getBossTrophyRewards(boss.id)[0];
  const item = getCollectionItemById(reward.collectionItemId);
  const state = seed();
  const before = JSON.stringify(state);
  check(item?.category === "avatar" && !!getCollectionSprite(item.id), `${boss.id}: avatar mapping`);
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
  check(getActiveCharacterCosmetics(character, claim.guild.collections).avatar?.id === reward.collectionItemId, `${boss.id}: equipped avatar resolves`);
  check(JSON.stringify(state) === before, `${boss.id}: inputs unchanged`);
  check(claim.guild.gold === state.guild.gold && character.attributes === state.characters[0].attributes, `${boss.id}: no power or economy change`);
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
      <h1 style={{ fontSize: 20 }}>Stage 166 - Collection Art QA</h1>
      <p>{checks.length}/{checks.length} deterministic checks passed. Memory-only fixture.</p>
      <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["Gallery", "Trophy Hall", "Collections", "Profile"].map((tab) => <button key={tab} onClick={() => setView(tab)}>{tab}</button>)}
        <label><input type="checkbox" checked={missing} onChange={(event) => {
          const next = event.target.checked;
          for (const id of avatarIds) collectionSprites[id] = { ...originalSprites[id], src: next ? `/qa/missing/${id}.png` : originalSprites[id].src };
          setMissing(next);
        }} />Simulate unavailable artwork</label>
        <button onClick={() => setState(seed())}>Reset fixture</button>
        <button onClick={() => setState((current) => {
          let guild = current.guild;
          for (const boss of bosses) guild = claimBossTrophyReward(guild, getBossTrophyRewards(boss.id)[0].id).guild;
          return { ...current, guild };
        })}>Claim all six avatars</button>
      </nav>
      <div key={String(missing)}>
        {view === "Gallery" ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {avatarIds.map((id) => <article key={id}>
            <div style={{ width: 144, height: 144 }}><CollectionPreview item={getCollectionItemById(id)} /></div>
            <h2 style={{ fontSize: 14 }}>{getCollectionItemById(id)?.name}</h2>
            <div className="collections-card-preview is-avatar"><CollectionPreview item={getCollectionItemById(id)} /></div>
          </article>)}
        </div> : null}
        {view === "Trophy Hall" ? <BossTrophyHall bosses={bosses} guild={state.guild} selectedBoss={selectedBoss} onSelectBoss={setSelectedBoss} onClaimReward={(id) => setState((current) => ({ ...current, guild: claimBossTrophyReward(current.guild, id).guild }))} /> : null}
        {view === "Collections" ? <CollectionsHall character={character} guild={state.guild} onEquip={(id) => setState((current) => ({ ...current, characters: [equipCollectionItem(current.characters[0], current.guild, id), ...current.characters.slice(1)] }))} onMarkSeen={() => setState((current) => ({ ...current, guild: clearNewCollectionFlags(current.guild) }))} /> : null}
        {view === "Profile" ? <>
          <CharacterSprite character={character} avatar={avatar} size="large" />
          <div style={{ width: "min(100%, 320px)" }}><RightCharacterPanel character={character} guild={state.guild} logs={[]} /></div>
        </> : null}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<CollectionArtQa />);
