import { useMemo } from "react";
import { getGuildDirectiveStatus } from "../../game-engine/guild-directives/getGuildDirectiveStatus";
import type { Character, Guild } from "../../shared/types";

interface GuildDirectivesBoardProps {
  characters: Character[];
  guild: Guild;
  onActivate: (directiveId: string) => void;
}

export function GuildDirectivesBoard({ characters, guild, onActivate }: GuildDirectivesBoardProps) {
  const status = useMemo(() => getGuildDirectiveStatus(guild, characters), [characters, guild]);
  return (
    <section className="guild-directives-board">
      <header className="ranking-section-heading">
        <div><span>Guild command policy</span><h3>Active Directive</h3></div>
        <strong>{status.activeDirective ? `${status.activeDirective.name} / ${status.activeDirective.bonusLabel}` : "No directive active"}</strong>
      </header>
      <div className="guild-directives-status">
        <span>{status.unlockedCount}/{status.directives.length} unlocked at Guild Level {status.progression.level}</span>
        <strong>Changes apply to future assignments</strong>
      </div>
      <div className="guild-directives-grid">
        {status.directives.map(({ definition, unlocked, active }) => (
          <article className={`${active ? "is-active" : ""} ${!unlocked ? "is-locked" : ""}`.trim()} key={definition.id}>
            <div className="guild-directive-heading">
              <i>{definition.sigil}</i>
              <span><small>Guild Level {definition.minimumGuildLevel}</small><strong>{definition.name}</strong></span>
              <b>{definition.bonusLabel}</b>
            </div>
            <p>{definition.description}</p>
            <button disabled={!unlocked || active || !status.canChange} onClick={() => onActivate(definition.id)} type="button">
              {active ? "Active Directive" : !unlocked ? `Requires Level ${definition.minimumGuildLevel}` : !status.canChange ? "Operations Active" : "Activate Directive"}
            </button>
          </article>
        ))}
      </div>
      <small className="guild-directives-note">One guild-wide directive may be active. Policy changes are free and local; hunts, quests, training and expeditions already underway keep the bonus recorded when they started.</small>
    </section>
  );
}
