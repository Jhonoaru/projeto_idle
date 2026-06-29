import { StatBox } from "../ui/StatBox";
import type { Guild } from "../../shared/types";
import { GAME_TITLE } from "../../shared/constants";

interface TopBarProps {
  guild: Guild;
  saveStatus?: string;
  onManualSave?: () => void;
  onReloadSave?: () => void;
  onResetSave?: () => void;
}

export function TopBar({
  guild,
  saveStatus,
  onManualSave,
  onReloadSave,
  onResetSave,
}: TopBarProps) {
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
      <div className="save-controls" aria-label="Save controls">
        <span>{saveStatus ?? "SQLite local"}</span>
        <button onClick={onManualSave} type="button">Salvar agora</button>
        <button onClick={onReloadSave} type="button">Recarregar save</button>
        <button onClick={onResetSave} type="button">Resetar save</button>
      </div>
    </header>
  );
}
