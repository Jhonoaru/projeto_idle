import { canContinueAutoRepeat, normalizeCompletedRepeats } from "./canContinueAutoRepeat";
import { createNextRepeatedHuntAction } from "./createNextRepeatedHuntAction";
import type {
  AutoRepeatSummary,
  Character,
  Guild,
  GuildDepot,
  HuntArea,
  HuntAutoRepeatConfig,
} from "../../shared/types";

export function resolveAutoRepeatAfterHunt({
  character,
  hunt,
  guild,
  depot,
  previousConfig,
  durationMinutes,
  guildXpBonusPercent = 0,
}: {
  character: Character;
  hunt: HuntArea;
  guild: Guild;
  depot: GuildDepot;
  previousConfig?: HuntAutoRepeatConfig;
  durationMinutes: number;
  guildXpBonusPercent?: number;
}): { character: Character; logs: string[]; summary: AutoRepeatSummary } {
  if (!previousConfig?.enabled) {
    return {
      character,
      logs: [],
      summary: { startedNextRun: false, message: "Auto-repeat disabled." },
    };
  }

  const completedConfig = {
    ...previousConfig,
    completedRepeats: normalizeCompletedRepeats(previousConfig.completedRepeats) + 1,
    updatedAt: new Date().toISOString(),
  };
  const validation = canContinueAutoRepeat(character, hunt, guild, depot, completedConfig, durationMinutes);

  if (!validation.canContinue) {
    return {
      character,
      logs: [validation.message],
      summary: {
        startedNextRun: false,
        stopReason: validation.reason,
        message: validation.message,
      },
    };
  }

  const nextCharacter = createNextRepeatedHuntAction(character, hunt, completedConfig, durationMinutes, guildXpBonusPercent);
  const maxRepeats = nextCharacter.currentAction?.maxRepeatIndex ?? completedConfig.maxRepeats ?? 1;
  const repeatIndex = nextCharacter.currentAction?.repeatIndex ?? completedConfig.completedRepeats + 1;
  const message = `Auto-repeat: ${character.name} started ${hunt.name} again. Run ${repeatIndex}/${maxRepeats}.`;

  return {
    character: nextCharacter,
    logs: [message],
    summary: {
      startedNextRun: true,
      message,
    },
  };
}
