import { useEffect, useMemo, useState } from "react";
import { calculateBossRisk } from "../../game-engine/boss/calculateBossRisk";
import { calculateBossPartyThreat } from "../../game-engine/boss/calculateBossThreat";
import { formatDuration, getClockElapsedMs, getClockRemainingMs } from "../../shared/time";
import type { Boss, BossParty, Character } from "../../shared/types";
import { BossSprite } from "../boss/BossSprite";
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
}

export function BossScene({
  boss,
  character,
  characters,
  party,
  onAbortBoss,
  onCollectBoss,
  onOpenAction,
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
    const interval = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!action || action.type !== "bossing") return null;

  const totalMs = Math.max(1, (action.durationMinutes ?? boss?.durationMinutes ?? 1) * 60_000);
  const ready = action.readyToResolve === true || getClockRemainingMs(action.endsAt) <= 0;
  const remainingMs = ready ? 0 : getClockRemainingMs(action.endsAt);
  const elapsedMs = ready ? totalMs : Math.min(totalMs, getClockElapsedMs(action.startedAt));
  const progress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
  const threat = boss ? calculateBossPartyThreat(characters, activeParty, boss) : undefined;
  const risk = boss && threat ? calculateBossRisk(characters, activeParty, boss, {
    attackBonusPercent: 0,
    deathRiskReductionPercent: 0,
    threat,
  }) : undefined;
  const pulse = Math.floor(clock / 1_000) % 3;

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
            <small>{ready ? "Defeated" : ["Casting", "Striking", "Guarding"][pulse]}</small>
          </div>
          <div className={`boss-scene-party party-size-${Math.min(5, Math.max(1, members.length))}`}>
            {members.map((member, index) => (
              <div className={`boss-scene-party-member member-${index + 1}`} key={member.characterId}>
                <CharacterSprite character={member.character} size="scene" />
                <strong>{member.character.name}</strong>
                <span>{member.role}</span>
              </div>
            ))}
          </div>
          <CombatEffectLayer actors={members} mode="boss" resolved={ready} target={{ x: 76, y: 43 }} />
          <CombatSkillRotation actors={members} elapsedMs={elapsedMs} resolved={ready} />
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
