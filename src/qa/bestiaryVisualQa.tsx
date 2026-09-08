import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BestiaryPanel } from "../components/bestiary/BestiaryPanel";
import { createInitialGameState } from "../database/saveGameRepository";
import "../styles.css";

const state = structuredClone(createInitialGameState());
state.guild.bestiary = {
  charmPoints: 35,
  unlockedCharmIds: [],
  activeCharms: [],
  progress: [
    { monsterId: "monster-dragon-whelp", monsterName: "Dragon Whelp", kills: 1000, stage: "completed", charmPointsClaimed: false },
    { monsterId: "monster-cave-spider", monsterName: "Cave Spider", kills: 50, stage: "revealed", charmPointsClaimed: false },
    { monsterId: "monster-sewer-rat", monsterName: "Sewer Rat", kills: 10, stage: "started", charmPointsClaimed: false },
  ],
};

function BestiaryVisualQa() {
  const [checks, setChecks] = useState<string[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const results = [
        [document.querySelectorAll(".bestiary-card").length === 3, "three creature records render"],
        [document.querySelectorAll(".bestiary-card-sigil img").length === 3, "all record sprites load"],
        [document.querySelector(".bestiary-dossier-identity strong")?.textContent === "Dragon Whelp", "completed dossier is selected"],
        [document.querySelectorAll(".bestiary-loot-grid article").length >= 4, "completed dossier shows real loot entries"],
        [document.querySelector(".bestiary-dossier-loot")?.textContent?.includes("0.15%"), "rare drop chance remains legible"],
        [document.documentElement.scrollWidth <= innerWidth, "no horizontal overflow"],
      ].map(([passed, label]) => `${passed ? "PASS" : "FAIL"} ${label}`);
      setChecks(results);
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return <main className="bestiary-visual-qa">
    <header><span>STAGE 177</span><h1>Bestiary Visual QA</h1><p>{checks.length ? checks.join(" / ") : "Running component checks..."}</p></header>
    <BestiaryPanel character={state.characters[0]} guild={state.guild} onAssignCharm={() => undefined} onClaimReward={() => undefined} onOpenFocus={() => undefined} onRemoveCharm={() => undefined} onUnlockCharm={() => undefined} />
  </main>;
}

createRoot(document.getElementById("root")!).render(<BestiaryVisualQa />);
