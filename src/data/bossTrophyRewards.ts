import type { BossTrophyRewardTier } from "../shared/types";

export interface BossTrophyRewardDefinition {
  id: string;
  bossId: string;
  tier: BossTrophyRewardTier;
  label: string;
  description: string;
  collectionItemId: string;
}

export const bossTrophyRewards: BossTrophyRewardDefinition[] = [
  reward("boss-sewer-broodmother", "conquered", "Broodmother Crest", "Archive the first victory over the Sewer Broodmother.", "avatar-broodmother-crest"),
  reward("boss-sewer-broodmother", "mastered", "Webkeeper Regalia", "Master the Sewer Broodmother record.", "outfit-webkeeper"),
  reward("boss-sewer-broodmother", "flawless", "Sewer Stalker", "Complete the flawless Sewer Broodmother record.", "mount-sewer-stalker"),
  reward("boss-grunk-camp-breaker", "conquered", "Camp Breaker Mark", "Archive the first victory over Grunk.", "avatar-camp-breaker-mark"),
  reward("boss-grunk-camp-breaker", "mastered", "Warcamp Raider", "Master Grunk's operation record.", "outfit-warcamp-raider"),
  reward("boss-grunk-camp-breaker", "flawless", "War Boar", "Complete the flawless Grunk record.", "mount-war-boar"),
  reward("boss-crypt-warden", "conquered", "Crypt Warden Seal", "Archive the first victory over the Crypt Warden.", "avatar-crypt-warden-seal"),
  reward("boss-crypt-warden", "mastered", "Crypt Sentinel", "Master the Crypt Warden record.", "outfit-crypt-sentinel"),
  reward("boss-crypt-warden", "flawless", "Grave Charger", "Complete the flawless Crypt Warden record.", "mount-grave-charger"),
  reward("boss-khazgrim-gatekeeper", "conquered", "Khazgrim Gate Sigil", "Archive the first victory over Khazgrim Gatekeeper.", "avatar-khazgrim-gate-sigil"),
  reward("boss-khazgrim-gatekeeper", "mastered", "Gatekeeper Plate", "Master the Khazgrim Gatekeeper record.", "outfit-gatekeeper-plate"),
  reward("boss-khazgrim-gatekeeper", "flawless", "Ironhorn Ram", "Complete the flawless Khazgrim record.", "mount-ironhorn-ram"),
  reward("boss-ember-matriarch", "conquered", "Ember Crown", "Archive the first victory over the Ember Matriarch.", "avatar-ember-crown"),
  reward("boss-ember-matriarch", "mastered", "Ashen Warden", "Master the Ember Matriarch record.", "outfit-ashen-warden"),
  reward("boss-ember-matriarch", "flawless", "Cinder Drake", "Complete the flawless Ember Matriarch record.", "mount-cinder-drake"),
  reward("boss-novice-arena-champion", "conquered", "Arena Laurel", "Archive the first victory in the Novice Arena.", "avatar-arena-laurel"),
  reward("boss-novice-arena-champion", "mastered", "Arena Champion", "Master the Novice Arena record.", "outfit-arena-champion"),
  reward("boss-novice-arena-champion", "flawless", "Victory Lion", "Complete the flawless Novice Arena record.", "mount-victory-lion"),
];

export function getBossTrophyRewards(bossId: string) {
  return bossTrophyRewards.filter((entry) => entry.bossId === bossId);
}

export function getBossTrophyReward(rewardId: string) {
  return bossTrophyRewards.find((entry) => entry.id === rewardId);
}

function reward(bossId: string, tier: BossTrophyRewardTier, label: string, description: string, collectionItemId: string): BossTrophyRewardDefinition {
  return { id: `${bossId}:${tier}`, bossId, tier, label, description, collectionItemId };
}
