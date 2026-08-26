import { useEffect, useMemo, useState } from "react";
import { calculateBossRisk } from "../../game-engine/boss/calculateBossRisk";
import { calculateBossPartyThreat } from "../../game-engine/boss/calculateBossThreat";
import { getBossAbilityCastState } from "../../game-engine/boss/getBossAbilityCastState";
import { planBossDefensiveResponses } from "../../game-engine/boss/planBossDefensiveResponses";
import { planBossInterrupts } from "../../game-engine/boss/planBossInterrupts";
import { planBossTelegraphDodges } from "../../game-engine/boss/planBossTelegraphDodges";
import { calculateBossDodgeTradeOffs } from "../../game-engine/boss/calculateBossDodgeTradeOffs";
import { normalizeBossManualReactions, type BossManualReactionRequest } from "../../game-engine/boss/recordBossManualReaction";
import {
  getBossManualReactionEffects,
  getBossManualReactionTiming,
  normalizeBossManualReactionQuality,
} from "../../game-engine/boss/getBossManualReactionTiming";
import { normalizeBossDodgeBehavior } from "../../game-engine/combat-skills/normalizeCombatSkillLoadout";
import { simulateCombatSkillRotation } from "../../game-engine/combat-skills/simulateCombatSkillRotation";
import { formatDuration, getClockElapsedMs, getClockRemainingMs } from "../../shared/time";
import type { Boss, BossParty, Character } from "../../shared/types";
import { BossSprite } from "../boss/BossSprite";
import { BossPhaseTimeline, getActiveBossPhase } from "../boss/BossPhaseTimeline";
import { CharacterSprite } from "../characters/CharacterSprite";
import { CombatEffectLayer } from "../combat-effects/CombatEffectLayer";
import { CombatSkillRotation } from "../combat-skills/CombatSkillRotation";
import { BossArenaBackground } from "./BossArenaBackground";

interface BossSceneProps {
  boss?: Boss;
  character: Character;
  characters: Character[];
  party: BossParty;
  onAbortBoss: () => void;
  onCollectBoss: () => void;
  onOpenAction: () => void;
  onBossManualReaction: (request: BossManualReactionRequest) => void;
}

export function BossScene({
  boss,
  character,
  characters,
  party,
  onAbortBoss,
  onCollectBoss,
  onOpenAction,
  onBossManualReaction,
}: BossSceneProps) {
  const action = character.currentAction;
  const [clock, setClock] = useState(Date.now());
  const activeParty = useMemo(
    () => getActiveParty(action?.partyMembers, action?.partyMemberIds, party, boss?.id),
    [action?.partyMemberIds, action?.partyMembers, boss?.id, party],
  );
  const members = activeParty.members
    .map((member) => ({ ...member, character: characters.find((entry) => entry.id === member.characterId) }))
    .filter((member): member is typeof member & { character: Character } => Boolean(member.character));

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 200);
    return () => window.clearInterval(interval);
  }, []);

  if (!action || action.type !== "bossing") return null;

  const totalMs = Math.max(1, (action.durationMinutes ?? boss?.durationMinutes ?? 1) * 60_000);
  const ready = action.readyToResolve === true || getClockRemainingMs(action.endsAt) <= 0;
  const remainingMs = ready ? 0 : getClockRemainingMs(action.endsAt);
  const elapsedMs = ready ? totalMs : Math.min(totalMs, getClockElapsedMs(action.startedAt));
  const progress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
  const threat = boss ? calculateBossPartyThreat(characters, activeParty, boss) : undefined;
  const pulse = Math.floor(clock / 1_000) % 3;
  const activePhase = threat ? getActiveBossPhase(threat, progress) : undefined;
  const abilityCast = getBossAbilityCastState(threat, elapsedMs, ready);
  const visibleCast = abilityCast.cast ?? abilityCast.nextCast;
  const responseParticipants = members.map((member) => ({ character: member.character, rotation: simulateCombatSkillRotation(member.character, member.character.currentAction, totalMs) }));
  const interrupts = threat ? planBossInterrupts(responseParticipants, threat.abilityCasts, totalMs) : [];
  const interruptedCastIds = new Set(interrupts.filter((entry) => entry.interrupted).map((entry) => entry.castId));
  const dodgeEligibleCasts = threat ? threat.abilityCasts.filter((cast) => !interruptedCastIds.has(cast.castId)) : [];
  const telegraphDodges = planBossTelegraphDodges(members.map((member) => member.character), dodgeEligibleCasts, totalMs);
  const dodgeTradeOffs = calculateBossDodgeTradeOffs(members.map((member) => member.character), dodgeEligibleCasts, telegraphDodges);
  const positioningAttackBonusPercent = dodgeTradeOffs.reduce((sum, entry) => sum + entry.offensiveBonusPercent, 0) / Math.max(1, members.length);
  const risk = boss && threat ? calculateBossRisk(characters, activeParty, boss, {
    attackBonusPercent: positioningAttackBonusPercent,
    deathRiskReductionPercent: 0,
    threat,
  }) : undefined;
  const dodgedCastIds = new Set(telegraphDodges.filter((entry) => entry.dodged).map((entry) => entry.castId));
  const defensiveResponses = threat ? planBossDefensiveResponses(responseParticipants, dodgeEligibleCasts.filter((cast) => !dodgedCastIds.has(cast.castId)), totalMs) : [];
  const activeInterrupt = abilityCast.cast ? interrupts.find((entry) => entry.castId === abilityCast.cast?.castId) : undefined;
  const interruptResolved = Boolean(activeInterrupt && elapsedMs >= activeInterrupt.occurredAtMs);
  const activeDodge = abilityCast.cast ? telegraphDodges.find((entry) => entry.castId === abilityCast.cast?.castId) : undefined;
  const dodgeResolved = Boolean(activeDodge && elapsedMs >= activeDodge.occurredAtMs);
  const dodgeTarget = visibleCast?.targetCharacterId
    ? members.find((member) => member.characterId === visibleCast.targetCharacterId)?.character
    : undefined;
  const dodgeTargetLoadout = dodgeTarget?.currentAction?.combatSkillLoadout ?? dodgeTarget?.combatSkillLoadout;
  const activeDodgeBehavior = normalizeBossDodgeBehavior(dodgeTargetLoadout?.bossDodgeBehavior);
  const activeDodgeTradeOff = dodgeTarget ? dodgeTradeOffs.find((entry) => entry.characterId === dodgeTarget.id) : undefined;
  const activeResponse = abilityCast.cast ? defensiveResponses.find((response) => response.castId === abilityCast.cast?.castId) : undefined;
  const activeManualReaction = abilityCast.cast
    ? normalizeBossManualReactions(action.bossManualReactions).find((reaction) => reaction.castId === abilityCast.cast?.castId)
    : undefined;
  const manualReactionBlocked = Boolean(activeInterrupt && interruptResolved && activeInterrupt.interrupted);
  const manualTiming = abilityCast.cast
    ? getBossManualReactionTiming(action.startedAt, abilityCast.cast, new Date(clock))
    : undefined;
  const manualEffects = getBossManualReactionEffects(manualTiming?.quality);

  function reactToActiveCast(reactionType: "dodge" | "hold") {
    const cast = abilityCast.cast;
    if (!cast?.targetCharacterId || !cast.targetCharacterName || activeManualReaction || manualReactionBlocked) return;
    onBossManualReaction({
      castId: cast.castId,
      abilityId: cast.abilityId,
      abilityName: cast.abilityName,
      targetCharacterId: cast.targetCharacterId,
      targetCharacterName: cast.targetCharacterName,
      reactionType,
      recordedAt: new Date().toISOString(),
      telegraphStartsAtMs: cast.telegraphStartsAtMs,
      resolvesAtMs: cast.resolvesAtMs,
    });
  }

  return (
    <section className={`boss-scene ${ready ? "is-ready" : "is-running"}`}>
      <aside className="boss-scene-side">
        <header>
          <span className="eyebrow">Raid operation</span>
          <h2>{boss?.name ?? action.targetName ?? "Unknown Boss"}</h2>
          <p>{ready ? "The raid report is ready for collection." : "Your strike team is fighting inside the arena."}</p>
        </header>

        <div className="boss-scene-timer">
          <span>{ready ? "Report ready" : "Remaining"}</span>
          <strong>{formatDuration(remainingMs)}</strong>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="boss-scene-actions">
          {ready ? (
            <button className="is-primary" onClick={onCollectBoss} type="button">Collect Raid Report</button>
          ) : (
            <button className="is-danger" onClick={onAbortBoss} type="button">Abort and Return</button>
          )}
          <button onClick={onOpenAction} type="button">Action Details</button>
        </div>

        <section className="boss-scene-analyzer">
          <header><span>Raid analyzer</span><strong>{progress}%</strong></header>
          <dl>
            <div><dt>Party</dt><dd>{members.length}</dd></div>
            <div><dt>Success</dt><dd>{risk ? `${Math.round(risk.successChance * 100)}%` : "-"}</dd></div>
            <div><dt>Death risk</dt><dd>{risk ? `${Math.round(risk.deathChance * 100)}%` : "-"}</dd></div>
            <div><dt>Tank control</dt><dd>{threat ? `${threat.tankAggroControlPercent}%` : "-"}</dd></div>
            <div><dt>Current phase</dt><dd>{activePhase?.phaseName ?? "-"}</dd></div>
            <div><dt>Current target</dt><dd>{activePhase?.members.find((member) => member.primaryTarget)?.characterName ?? "-"}</dd></div>
            <div><dt>Phase pressure</dt><dd>{activePhase ? `${activePhase.attackRateMultiplier}x / ${activePhase.incomingDamageMultiplier}x` : "-"}</dd></div>
            <div><dt>Special ability</dt><dd>{activePhase?.specialAbility?.name ?? "-"}</dd></div>
            <div><dt>Ability state</dt><dd>{formatAbilityState(abilityCast.state, abilityCast.remainingMs)}</dd></div>
            <div><dt>Ability target</dt><dd>{visibleCast?.targetCharacterName ?? "-"}</dd></div>
            <div><dt>Telegraph</dt><dd>{visibleCast ? `${formatTelegraphProfile(visibleCast.telegraphProfile)} / ${visibleCast.dodgeDifficultyPercent}% difficulty` : "-"}</dd></div>
            <div><dt>Interrupt</dt><dd>{activeInterrupt ? `${activeInterrupt.skillName} / ${interruptResolved ? activeInterrupt.interrupted ? "Success" : "Resisted" : "Ready"} / ${activeInterrupt.successChancePercent}%` : "None ready"}</dd></div>
            <div><dt>Dodge</dt><dd>{activeDodge ? `${activeDodge.targetCharacterName} / ${formatDodgeBehavior(activeDodge.dodgeBehavior)} / ${dodgeResolved ? activeDodge.dodged ? "Dodged" : "Caught" : "Ready"} / ${activeDodge.successChancePercent}%` : dodgeTarget ? `${dodgeTarget.name} / ${formatDodgeBehavior(activeDodgeBehavior)} / No attempt` : "Not targeted"}</dd></div>
            <div><dt>Positioning</dt><dd>{activeDodgeTradeOff ? `${formatPositioning(activeDodgeTradeOff.positioning)} / +${activeDodgeTradeOff.offensiveBonusPercent}% power / ${activeDodgeTradeOff.unavoidedTelegraphs} exposed` : "No trade-off"}</dd></div>
            <div><dt>Manual command</dt><dd>{activeManualReaction ? `${formatManualReaction(activeManualReaction.reactionType)} / ${formatReactionQuality(activeManualReaction.quality)}` : manualReactionBlocked ? "Cast interrupted" : abilityCast.state === "telegraphing" ? `${formatReactionQuality(manualTiming?.quality)} window` : "No active telegraph"}</dd></div>
            <div><dt>Auto response</dt><dd>{activeResponse ? `${activeResponse.skillName} / ${activeResponse.sourceCharacterName} / ${formatResponsePriority(activeResponse.configuredPriority)}` : "None ready"}</dd></div>
            <div><dt>Entry cost</dt><dd>{action.cost?.toLocaleString("en-US") ?? 0}g</dd></div>
            <div><dt>XP reward</dt><dd>{action.expectedXp?.toLocaleString("en-US") ?? "-"}</dd></div>
            <div><dt>Gold max</dt><dd>{action.expectedGold?.toLocaleString("en-US") ?? "-"}g</dd></div>
          </dl>
        </section>

        <section className="boss-scene-roster">
          <header><span>Strike team</span><strong>{members.length}</strong></header>
          {members.map((member) => (
            <article key={member.characterId}>
              <CharacterSprite character={member.character} size="small" />
              <div><strong>{member.character.name}</strong><span>{member.role} / Lv {member.character.level}</span></div>
            </article>
          ))}
        </section>
      </aside>

      <div className="boss-scene-main">
        <div className="boss-scene-stage">
          <BossArenaBackground boss={boss} />
          <div className="boss-scene-boss-actor">
            <BossSprite boss={boss} fallbackSymbol="B" size="scene" />
            <strong>{boss?.name ?? action.targetName}</strong>
            <small>{ready ? "Defeated" : abilityCast.state === "telegraphing" ? "Casting" : abilityCast.state === "cooldown" ? "Recovering" : ["Watching", "Striking", "Guarding"][pulse]}</small>
          </div>
          {abilityCast.state === "telegraphing" && abilityCast.cast ? (
            <div className={`boss-ability-telegraph profile-${abilityCast.cast.telegraphProfile}`} role="status" aria-live="polite">
              <span>Boss ability / {formatTelegraphProfile(abilityCast.cast.telegraphProfile)}</span>
              <strong>{abilityCast.cast.abilityName}</strong>
              <small>{abilityCast.cast.targetCharacterName ? `Target: ${abilityCast.cast.targetCharacterName}` : "Arena cast"}</small>
              {activeInterrupt && (!interruptResolved || activeInterrupt.interrupted) ? (
                <em className={interruptResolved ? activeInterrupt.interrupted ? "is-interrupted" : "is-resisted" : ""}>
                  {activeInterrupt.sourceCharacterName}: {activeInterrupt.skillName} / {interruptResolved ? activeInterrupt.interrupted ? "interrupted" : "resisted" : "ready"} / {activeInterrupt.successChancePercent}%
                </em>
              ) : activeDodge ? (
                <em className={dodgeResolved ? activeDodge.dodged ? "is-dodged" : "is-caught" : ""}>
                  {activeDodge.targetCharacterName}: dodge / {dodgeResolved ? activeDodge.dodged ? "dodged" : "caught" : "ready"} / {activeDodge.successChancePercent}%
                </em>
              ) : activeResponse ? <em>{activeResponse.sourceCharacterName}: {activeResponse.skillName} ready / {formatResponsePriority(activeResponse.configuredPriority)}</em> : <em>No automatic response ready</em>}
              <div className="boss-ability-cast-progress"><i style={{ width: `${abilityCast.progressPercent}%` }} /></div>
              <b>{formatCastSeconds(abilityCast.remainingMs)}</b>
              {abilityCast.cast.targetCharacterId ? (
                <div className={`boss-manual-reaction-controls quality-${normalizeBossManualReactionQuality(activeManualReaction?.quality ?? manualTiming?.quality)}`} aria-label="Manual Boss reaction">
                  <div className="boss-manual-reaction-timing">
                    <span>{activeManualReaction ? "Reaction quality" : "Current timing"}</span>
                    <strong>{formatReactionQuality(activeManualReaction?.quality ?? manualTiming?.quality)}</strong>
                    <div aria-hidden="true">
                      <i className="is-early" />
                      <i className="is-perfect" />
                      <i className="is-late" />
                      {!activeManualReaction && manualTiming?.timingPercent !== undefined ? <b style={{ left: `${manualTiming.timingPercent}%` }} /> : null}
                    </div>
                    <small>{activeManualReaction?.timingPercent !== undefined ? `${Math.round(activeManualReaction.timingPercent)}% into cast` : manualTiming?.timingPercent !== undefined ? `${Math.round(manualTiming.timingPercent)}% into cast` : "Standard timing"}</small>
                  </div>
                  {activeManualReaction ? (
                    <strong>{formatManualReaction(activeManualReaction.reactionType)} locked / {formatReactionQuality(activeManualReaction.quality)}</strong>
                  ) : manualReactionBlocked ? (
                    <strong>Manual reaction unavailable: cast interrupted</strong>
                  ) : (
                    <>
                      <button onClick={() => reactToActiveCast("dodge")} type="button">Manual Dodge <small>+{manualEffects.dodgeBonusPercent}% chance</small></button>
                      <button onClick={() => reactToActiveCast("hold")} type="button">Hold Ground <small>+{manualEffects.holdPowerPercent}% power</small></button>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className={`boss-scene-party party-size-${Math.min(5, Math.max(1, members.length))}`}>
            {members.map((member, index) => {
              const tradeOff = dodgeTradeOffs.find((entry) => entry.characterId === member.characterId);
              return (
              <div className={`boss-scene-party-member member-${index + 1} is-${tradeOff?.positioning ?? "mobile"}`} key={member.characterId}>
                <CharacterSprite character={member.character} size="scene" />
                <strong>{member.character.name}</strong>
                <span>{member.role} / {formatPositioning(tradeOff?.positioning ?? "mobile")}</span>
              </div>
              );
            })}
          </div>
          <CombatEffectLayer actors={members} mode="boss" resolved={ready} target={{ x: 76, y: 43 }} />
          <CombatSkillRotation actors={members} elapsedMs={elapsedMs} resolved={ready} />
          {threat ? <BossPhaseTimeline threat={threat} progressPercent={progress} compact /> : null}
          <div className="boss-scene-stage-status">
            <span>{ready ? "Raid complete" : "Encounter in progress"}</span>
            <div><i style={{ width: `${progress}%` }} /></div>
            <strong>{progress}%</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatAbilityState(state: ReturnType<typeof getBossAbilityCastState>["state"], remainingMs: number) {
  if (state === "telegraphing") return `Casting / ${formatCastSeconds(remainingMs)}`;
  if (state === "cooldown") return `Cooldown / ${formatCastSeconds(remainingMs)}`;
  if (state === "resolved") return "Resolved";
  return "Ready";
}

function formatCastSeconds(milliseconds: number) {
  return `${Math.max(0, milliseconds / 1_000).toFixed(1)}s`;
}

function formatResponsePriority(priority: "automatic" | "prevent" | "recover") {
  return priority === "prevent" ? "Prevent" : priority === "recover" ? "Recover" : "Auto";
}

function formatTelegraphProfile(profile: "quick" | "focused" | "heavy") {
  return profile === "quick" ? "Quick" : profile === "heavy" ? "Heavy" : "Focused";
}

function formatDodgeBehavior(behavior: "automatic" | "safe_windows" | "hold_position") {
  return behavior === "safe_windows" ? "Safe Windows" : behavior === "hold_position" ? "Hold Position" : "Automatic";
}

function formatPositioning(value: "mobile" | "selective" | "anchored") {
  return value[0].toUpperCase() + value.slice(1);
}

function formatManualReaction(value: "dodge" | "hold") {
  return value === "dodge" ? "Manual Dodge" : "Hold Ground";
}

function formatReactionQuality(value: unknown) {
  const quality = normalizeBossManualReactionQuality(value);
  return quality === "perfect" ? "Perfect" : quality === "early" ? "Early" : quality === "late" ? "Late" : "Standard";
}

function getActiveParty(
  snapshotMembers: BossParty["members"] | undefined,
  snapshotIds: string[] | undefined,
  party: BossParty,
  bossId?: string,
): BossParty {
  if (snapshotMembers?.length) return { bossId: bossId ?? party.bossId, members: snapshotMembers };
  if (snapshotIds?.length) return { bossId: bossId ?? party.bossId, members: snapshotIds.map((characterId) => ({ characterId, role: "damage" })) };
  return party;
}
