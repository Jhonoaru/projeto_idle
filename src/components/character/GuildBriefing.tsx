import type { ActivityLogEntry, Character, Guild } from "../../shared/types";
import { getGuildBriefing, type GuildBriefingRoute } from "../../game-engine/onboarding/getGuildBriefing";

interface GuildBriefingProps {
  character: Character;
  guild: Guild;
  logs: ActivityLogEntry[];
  onNavigate: (route: GuildBriefingRoute) => void;
}

export function GuildBriefing({ character, guild, logs, onNavigate }: GuildBriefingProps) {
  const briefing = getGuildBriefing(character, guild, undefined, logs);

  return (
    <section className="guild-briefing" aria-label="Guild briefing">
      <div className="guild-briefing-command">
        <div>
          <span>Guild Briefing</span>
          <strong>{briefing.title}</strong>
          <p>{briefing.description}</p>
        </div>
        <button onClick={() => onNavigate(briefing.route)} type="button">
          {briefing.actionLabel}
        </button>
      </div>

      <ol className="guild-briefing-steps" aria-label="Opening assignments">
        {briefing.steps.map((step, index) => (
          <li className={step.complete ? "is-complete" : ""} key={step.id}>
            <span>{step.complete ? "OK" : index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </div>
          </li>
        ))}
      </ol>

      <div className="guild-briefing-progress">
        <span>Opening assignments</span>
        <i><b style={{ width: `${(briefing.completedSteps / briefing.steps.length) * 100}%` }} /></i>
        <strong>{briefing.completedSteps}/{briefing.steps.length}</strong>
      </div>
    </section>
  );
}
