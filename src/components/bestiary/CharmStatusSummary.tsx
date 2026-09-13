import { getCharmById } from "../../data/charms";
import { monsters } from "../../data/monsters";
import { calculateCharmBonusesForHunt } from "../../game-engine/bestiary/calculateCharmBonusesForHunt";
import { normalizeBestiaryState } from "../../game-engine/bestiary/getBestiaryProgress";
import type { GuildBestiaryState, HuntArea } from "../../shared/types";

interface CharmStatusSummaryProps {
  bestiary?: GuildBestiaryState;
  hunt?: HuntArea;
}

const monsterList = Object.values(monsters);

export function CharmStatusSummary({ bestiary, hunt }: CharmStatusSummaryProps) {
  const state = normalizeBestiaryState(bestiary);
  const assignments = state.activeCharms.flatMap((assignment) => {
    const charm = getCharmById(assignment.charmId);
    const monster = monsterList.find((entry) => entry.id === assignment.monsterId);
    return charm && monster ? [{ charm, monster }] : [];
  });
  const applicable = hunt
    ? assignments.filter(({ monster }) => hunt.monsters.some((entry) => entry.id === monster.id))
    : assignments;
  const bonuses = hunt ? calculateCharmBonusesForHunt(state, hunt) : undefined;

  return (
    <section className={`charm-status-summary${hunt ? " is-hunt-summary" : ""}`} aria-label={hunt ? "Charms active for this hunt" : "Guild active charms"}>
      <header>
        <div><span>{hunt ? "Hunt modifiers" : "Guild field effects"}</span><strong>{hunt ? "Active Charms" : "Active assignments"}</strong></div>
        <b>{applicable.length} active</b>
      </header>
      {applicable.length > 0 ? (
        <div className="charm-status-list">
          {applicable.map(({ charm, monster }) => {
            const dividedEffect = hunt ? charm.effectPercent / Math.max(1, hunt.monsters.length) : charm.effectPercent;
            return <article key={`${charm.id}-${monster.id}`}>
              <span className={`charm-status-sigil is-${charm.type}`}>{charm.type.slice(0, 2).toUpperCase()}</span>
              <div><strong>{charm.name}</strong><small>{monster.name}</small></div>
              <b>{formatEffect(dividedEffect, charm.type)}</b>
            </article>;
          })}
        </div>
      ) : (
        <p>{hunt ? "No assigned charm targets creatures in this hunt." : "Complete creature records to assign unlocked charms."}</p>
      )}
      {bonuses && bonuses.logs.length > 0 ? <footer>{bonuses.logs.join(" ")}</footer> : null}
    </section>
  );
}

function formatEffect(effect: number, type: string) {
  const value = `${effect.toFixed(effect % 1 === 0 ? 0 : 1)}%`;
  if (type === "defense") return `-${value} death risk`;
  if (type === "supply") return `-${value} supplies`;
  return `+${value} ${type}`;
}
