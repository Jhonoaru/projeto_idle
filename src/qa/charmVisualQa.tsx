import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CharmStatusSummary } from "../components/bestiary/CharmStatusSummary";
import { BestiaryPanel } from "../components/bestiary/BestiaryPanel";
import { hunts } from "../data/hunts";
import { createInitialGameState } from "../database/saveGameRepository";
import { calculateCharmBonusesForHunt } from "../game-engine/bestiary/calculateCharmBonusesForHunt";
import "../styles.css";

const state = structuredClone(createInitialGameState());
const caveSpiderHunt = hunts.find((hunt) => hunt.id === "hunt-cave-spider-cellar")!;
state.guild.bestiary = {
  charmPoints: 0,
  unlockedCharmIds: ["charm-scavenger"],
  activeCharms: [{ charmId: "charm-scavenger", monsterId: "monster-cave-spider", assignedAt: "2026-09-08T18:00:00.000Z" }],
  progress: [
    { monsterId: "monster-cave-spider", monsterName: "Cave Spider", kills: 100, stage: "completed", charmPointsClaimed: true },
    { monsterId: "monster-sewer-rat", monsterName: "Sewer Rat", kills: 10, stage: "started", charmPointsClaimed: false },
  ],
};

function CharmVisualQa() {
  const [checks, setChecks] = useState<string[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const bonus = calculateCharmBonusesForHunt(state.guild.bestiary, caveSpiderHunt);
      const results = [
        [document.querySelectorAll(".charm-status-summary").length === 2, "global and Hunt charm summaries render"],
        [document.querySelector(".bestiary-charms .charm-status-summary")?.textContent?.includes("Scavenger") && document.querySelector(".bestiary-charms .charm-status-summary")?.textContent?.includes("Cave Spider"), "Bestiary identifies the assigned charm target"],
        [document.querySelector(".charm-visual-hunt .charm-status-summary")?.textContent?.includes("+5% loot"), "Hunt summary exposes the applied loot effect"],
        [bonus.lootMultiplier === 1.05 && bonus.logs.length === 1, "production charm engine applies the expected multiplier"],
        [document.querySelector(".charm-card.is-assigned")?.textContent?.includes("Assigned to Cave Spider"), "Charm cabinet marks its active assignment"],
        [document.querySelector(".charm-card.is-linked") === null, "no stale moved-assignment state appears"],
        [document.documentElement.scrollWidth <= innerWidth, "Charm visual QA has no horizontal overflow"],
      ].map(([passed, label]) => `${passed ? "PASS" : "FAIL"} ${label}`);
      setChecks(results);
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return <main className="bestiary-visual-qa">
    <header><span>STAGE 178</span><h1>Charm Visual QA</h1><p>{checks.length ? checks.join(" / ") : "Running component checks..."}</p></header>
    <section className="charm-visual-hunt"><h2>Cave Spider Cellar: live Hunt reading</h2><CharmStatusSummary bestiary={state.guild.bestiary} hunt={caveSpiderHunt} /></section>
    <BestiaryPanel character={state.characters[0]} guild={state.guild} onAssignCharm={() => undefined} onClaimReward={() => undefined} onOpenFocus={() => undefined} onRemoveCharm={() => undefined} onUnlockCharm={() => undefined} />
  </main>;
}

createRoot(document.getElementById("root")!).render(<CharmVisualQa />);
