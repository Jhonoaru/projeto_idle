import { getAccessName } from "../../data/accesses";
import type { Boss, BossParty, Character, PartyRole } from "../../shared/types";

export function canStartBoss(
  characters: Character[],
  boss: Boss,
  selectedParty: BossParty,
  guildGold = Number.MAX_SAFE_INTEGER,
) {
  if (selectedParty.bossId !== boss.id) {
    return { canStart: false, reason: "Party selecionada nao pertence a este boss." };
  }

  if (boss.type === "solo" && selectedParty.members.length !== 1) {
    return { canStart: false, reason: `${boss.name} e solo e aceita exatamente 1 personagem.` };
  }

  if (selectedParty.members.length < boss.requirements.minPartySize) {
    return {
      canStart: false,
      reason: `${boss.name} requer pelo menos ${boss.requirements.minPartySize} participante(s).`,
    };
  }

  if (selectedParty.members.length > boss.requirements.maxPartySize) {
    return {
      canStart: false,
      reason: `${boss.name} aceita no maximo ${boss.requirements.maxPartySize} participante(s).`,
    };
  }

  const memberIds = selectedParty.members.map((member) => member.characterId);

  if (new Set(memberIds).size !== memberIds.length) {
    return { canStart: false, reason: "Party possui personagem duplicado." };
  }

  for (const memberId of memberIds) {
    const character = characters.find((candidate) => candidate.id === memberId);

    if (!character) {
      return { canStart: false, reason: "Personagem da party nao encontrado." };
    }

    if (character.status !== "idle") {
      return {
        canStart: false,
        reason: `${character.name} esta ${character.status} e nao pode iniciar boss.`,
      };
    }

    if (character.level < boss.requirements.requiredLevel) {
      return {
        canStart: false,
        reason: `${character.name} precisa ser level ${boss.requirements.requiredLevel}.`,
      };
    }

    const missingAccess = boss.requirements.requiredAccessIds?.find(
      (accessId) => !character.accessIds.includes(accessId),
    );

    if (missingAccess) {
      return {
        canStart: false,
        reason: `Requer acesso: ${getAccessName(missingAccess)}.`,
      };
    }

    const missingQuest = boss.requirements.requiredQuestIds?.find(
      (questId) => !character.completedQuestIds.includes(questId),
    );

    if (missingQuest) {
      return { canStart: false, reason: `Requer quest: ${missingQuest}.` };
    }

    if (
      boss.requirements.requiredVocations &&
      !boss.requirements.requiredVocations.includes(character.vocation)
    ) {
      return {
        canStart: false,
        reason: `${character.name} nao possui vocacao requerida para ${boss.name}.`,
      };
    }

    const cooldown = character.bossCooldowns.find(
      (entry) => entry.bossId === boss.id && new Date(entry.availableAt).getTime() > Date.now(),
    );

    if (cooldown) {
      return {
        canStart: false,
        reason: `${character.name} possui cooldown ativo em ${boss.name}.`,
      };
    }
  }

  const missingRole = findMissingRole(selectedParty, boss.requirements.requiredRoles);

  if (missingRole) {
    return {
      canStart: false,
      reason: `Party invalida: ${boss.name} requer ${missingRole.required} ${missingRole.role}.`,
    };
  }

  const entryCost = normalizeGold(boss.entryCost);
  if (normalizeGold(guildGold) < entryCost) {
    return {
      canStart: false,
      reason: `${boss.name} requer ${entryCost.toLocaleString("en-US")}g para preparar a tentativa.`,
    };
  }

  return { canStart: true };
}

function normalizeGold(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function findMissingRole(
  party: BossParty,
  requiredRoles?: Partial<Record<PartyRole, number>>,
) {
  if (!requiredRoles) return undefined;

  const roleCounts = party.members.reduce<Partial<Record<PartyRole, number>>>(
    (counts, member) => ({
      ...counts,
      [member.role]: (counts[member.role] ?? 0) + 1,
    }),
    {},
  );

  for (const [role, required] of Object.entries(requiredRoles)) {
    if ((roleCounts[role as PartyRole] ?? 0) < (required ?? 0)) {
      return { role, required };
    }
  }

  return undefined;
}
