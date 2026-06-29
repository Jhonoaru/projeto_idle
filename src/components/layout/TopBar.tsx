import { StatBox } from "../ui/StatBox";
import type { Guild } from "../../shared/types";
import { GAME_TITLE } from "../../shared/constants";

interface TopBarProps {
  guild: Guild;
}

export function TopBar({ guild }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-block">
        <span>{GAME_TITLE}</span>
        <h1>Guilda {guild.name}</h1>
      </div>
      <div className="top-stats" aria-label="Guild stats">
        <StatBox label="Gold" value={guild.gold} />
        <StatBox label="Renown" value={guild.renown} />
        <StatBox label="Rank" value={guild.rank} detail={`Level ${guild.level}`} />
      </div>
    </header>
  );
}
