import { useState } from "react";
import { createRoot } from "react-dom/client";
import { GameShell } from "../components/layout/GameShell";
import { TopBar } from "../components/layout/TopBar";
import { GuildNavigation } from "../components/layout/GuildNavigation";
import { GuildCentral } from "../components/layout/GuildCentral";
import { ExploreWindow } from "../components/explore/ExploreWindow";
import { GameWindow } from "../components/ui/GameWindow";
import { createInitialGameState } from "../database/saveGameRepository";
import { hunts } from "../data/hunts";
import { bosses } from "../data/bosses";
import { quests } from "../data/quests";
import type { MainPanelTab } from "../components/layout/MainPanel";
import type { HuntArea } from "../shared/types";
import "../styles.css";
import "../components/layout/client-refresh.css";
const state = createInitialGameState();
const noop = () => {};
function Preview() {
  const [tab, setTab] = useState<MainPanelTab>("hunts");
  const [character, setCharacter] = useState(state.characters[0]);
  const [boss, setBoss] = useState(bosses[0]);
  const [hunt, setHunt] = useState<HuntArea>();
  const [duration, setDuration] = useState(1);
  const select = (id: string) => setCharacter(state.characters.find(entry => entry.id === id)!);
  return <GameShell><TopBar activeTab={tab} guild={state.guild} selectedCharacter={character} onOpenTab={setTab} saveStatus="QA sem persistencia" />
    <GuildNavigation activeTab={tab} onOpenTab={setTab} />
    <div className="game-layout"><section className="main-panel">{tab === "central" ? <GuildCentral guild={state.guild} characters={state.characters} selectedCharacter={character} onSelectCharacter={select} onOpenTab={setTab} /> : <GameWindow title="Explorar" onClose={() => setTab("central")}>
      <ExploreWindow guild={state.guild} guildGold={state.guild.gold} character={character} characters={state.characters} bosses={bosses} hunts={hunts} quests={quests} selectedBoss={boss} selectedHunt={hunt} durationMinutes={duration} bossParty={{ bossId: boss.id, members: [] }}
        onReturnToCentral={() => setTab("central")} onSelectCharacter={select} onCancelBoss={noop} onChangeBossPartyRole={noop} onChangeDuration={setDuration} onFinishBoss={noop} onFinishQuest={noop} onFinishTraining={noop} onOpenSkills={noop} onClearSelectedHunt={() => setHunt(undefined)} onSelectBoss={setBoss} onSelectHunt={setHunt} onStartBoss={noop} onStartHunt={noop} onStartQuest={noop} onStartTraining={noop} onToggleBossPartyMember={noop} onLoadGuildSquad={noop} onClaimBossTrophyReward={noop} />
      <p data-testid="layout-end">Fim do conteudo · QA sem persistencia</p>
    </GameWindow>}</section></div>
  </GameShell>;
}
createRoot(document.getElementById("root")!).render(<Preview />);
