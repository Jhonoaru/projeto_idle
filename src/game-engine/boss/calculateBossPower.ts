import type { Boss, BossParty, Character, PartyRole, Vocation } from "../../shared/types";

const rolePower: Record<PartyRole, { offense: number; survival: number; support: number }> = {
  tank: { offense: 0.85, survival: 1.35, support: 1 },
  healer: { offense: 0.75, survival: 1.15, support: 1.45 },
  damage: { offense: 1.35, survival: 0.9, support: 1 },
  support: { offense: 0.95, survival: 1.05, support: 1.25 },
};

const vocationPower: Record<Vocation, { offense: number; survival: number; support: number }> = {
  Guardian: { offense: 0.95, survival: 1.35, support: 1 },
  Ranger: { offense: 1.25, survival: 0.95, support: 1 },
  Arcanist: { offense: 1.35, survival: 0.85, support: 1.05 },
  Warden: { offense: 1, survival: 1.05, support: 1.35 },
  Monk: { offense: 1.05, survival: 1.1, support: 1.2 },
};

export function calculateBossPower(
  characters: Character[],
  party: BossParty,
  boss: Boss,
) {
  const members = party.members
    .map((member) => ({
      member,
      character: characters.find((candidate) => candidate.id === member.characterId),
    }))
    .filter((entry): entry is { member: typeof party.members[number]; character: Character } =>
      Boolean(entry.character),
    );

  const totals = members.reduce(
    (power, { member, character }) => {
      const vocation = vocationPower[character.vocation];
      const role = rolePower[member.role];
      const levelPower = character.level * 3;
      const offense =
        (levelPower + character.attributes.attackPower + character.skills.magic.level) *
        vocation.offense *
        role.offense;
      const survival =
        (levelPower +
          character.attributes.defensePower +
          character.attributes.armor * 8 +
          character.attributes.maxHealth / 14) *
        vocation.survival *
        role.survival;
      const support =
        (character.skills.shielding.level + character.skills.magic.level + levelPower / 2) *
        vocation.support *
        role.support;

      return {
        offense: power.offense + offense,
        survival: power.survival + survival,
        support: power.support + support,
      };
    },
    { offense: 0, survival: 0, support: 0 },
  );

  const roles = new Set(party.members.map((member) => member.role));
  const hasTank = roles.has("tank");
  const hasHealer = roles.has("healer");
  const hasDamage = roles.has("damage");
  const hasSupport = roles.has("support");
  const synergy =
    1 +
    (hasTank ? 0.08 : 0) +
    (hasHealer ? 0.12 : 0) +
    (hasDamage ? 0.06 : 0) +
    (hasSupport ? 0.05 : 0) +
    (members.length >= 3 ? 0.08 : 0);
  const targetPower = boss.requirements.requiredLevel * boss.requirements.minPartySize * 14;

  return {
    offense: Math.round(totals.offense),
    survival: Math.round(totals.survival),
    support: Math.round(totals.support),
    synergy,
    totalPower: Math.round((totals.offense + totals.survival + totals.support * 0.65) * synergy),
    targetPower,
    hasHealer,
  };
}
