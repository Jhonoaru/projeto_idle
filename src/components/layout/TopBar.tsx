import { GameCurrencyPill } from "../ui/GameCurrencyPill";
import { GameIconButton } from "../ui/GameIconButton";
import type { Character, Guild } from "../../shared/types";
import { GAME_TITLE } from "../../shared/constants";
import type { MainPanelTab } from "./MainPanel";

interface TopBarProps {
  guild: Guild;
  selectedCharacter: Character;
  activeTab: MainPanelTab;
  saveStatus?: string;
  onOpenTab: (tab: MainPanelTab) => void;
  onManualSave?: () => void;
  onReloadSave?: () => void;
  onResetSave?: () => void;
}

export function TopBar({
  guild,
  selectedCharacter,
  activeTab,
  saveStatus,
  onOpenTab,
  onManualSave,
  onReloadSave,
  onResetSave,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-block">
        <span>{GAME_TITLE}</span>
        <h1>Guild Hunt</h1>
        <p>
          Guilda {guild.name} / {selectedCharacter.name} / Level {selectedCharacter.level}
        </p>
      </div>

      <div className="client-top-nav" aria-label="Main systems">
        <GameIconButton
          active={activeTab === "hunts"}
          className="is-explore"
          icon="E"
          label="Explorar"
          onClick={() => onOpenTab("hunts")}
        />
        <GameIconButton active={activeTab === "market"} icon="M" label="Market" onClick={() => onOpenTab("market")} />
        <GameIconButton active={activeTab === "forge"} icon="F" label="Forge" onClick={() => onOpenTab("forge")} />
        <GameIconButton active={activeTab === "imbuing"} icon="I" label="Imbuing" onClick={() => onOpenTab("imbuing")} />
        <GameIconButton active={activeTab === "daily"} icon="D" label="Daily" onClick={() => onOpenTab("daily")} />
        <GameIconButton active={activeTab === "ranking"} icon="R" label="Ranking" onClick={() => onOpenTab("ranking")} />
        <GameIconButton active={activeTab === "store"} icon="S" label="Store" onClick={() => onOpenTab("store")} />
      </div>

      <div className="client-top-right" aria-label="Client utilities">
        <GameCurrencyPill label="Gold" value={`${guild.gold.toLocaleString("en-US")}g`} />
        <GameCurrencyPill label="Cosmetic" tone="future" value="0" />
        <div className="client-utility-buttons">
          <button onClick={() => onOpenTab("updates")} type="button">Updates</button>
          <button onClick={() => onOpenTab("wiki")} type="button">Wiki</button>
          <button onClick={() => onOpenTab("settings")} type="button">Settings</button>
        </div>
        <div className="save-controls" aria-label="Save controls">
          <span>{saveStatus ?? "SQLite local"}</span>
          <button onClick={onManualSave} type="button">Save</button>
          <button onClick={onReloadSave} type="button">Reload</button>
          <button onClick={onResetSave} type="button">Reset</button>
        </div>
      </div>
    </header>
  );
}
