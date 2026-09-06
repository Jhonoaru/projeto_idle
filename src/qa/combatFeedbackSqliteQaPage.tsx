import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BossScene } from "../components/boss-scene/BossScene";
import { CombatFloatingFeedback } from "../components/combat-feedback/CombatFloatingFeedback";
import { HuntScene } from "../components/hunt-scene/HuntScene";
import type { Character } from "../shared/types";
import { findCriticalElapsed, runStage1725Qa, saveStage1725RuntimeReport, stage1725Boss, stage1725Hunt, type Stage1725QaResult } from "./combatFeedbackSqliteQa";
import "../styles.css";

type SceneMode = "hunt" | "boss";
const noOp = () => undefined;

function CombatFeedbackSqliteQaPage() {
  const [result, setResult] = useState<Stage1725QaResult>();
  const [runtimeReport, setRuntimeReport] = useState<string[]>();
  const [error, setError] = useState<string>();
  const [sceneMode, setSceneMode] = useState<SceneMode>("hunt");
  const [vocationIndex, setVocationIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => { runStage1725Qa().then(setResult).catch((reason) => setError(String(reason))); }, []);
  useEffect(() => { document.documentElement.dataset.clientMotion = reduceMotion ? "reduced" : "full"; }, [reduceMotion]);
  useEffect(() => {
    if (!result) return undefined;
    const timer = window.setTimeout(() => {
      runRuntimeChecks().then(async (report) => { await saveStage1725RuntimeReport(report); setRuntimeReport(report); }).catch((reason) => setError(String(reason)));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [result]);

  const huntCharacters = useMemo(() => (completed ? result?.huntState.characters.map(withCompletedVisualState) : result?.huntState.characters) ?? [], [completed, result]);
  const bossCharacters = useMemo(() => (completed ? result?.bossState.characters.map(withCompletedVisualState) : result?.bossState.characters) ?? [], [completed, result]);
  const character = sceneMode === "hunt" ? huntCharacters[vocationIndex] : bossCharacters[0];

  if (error) return <main className="combat-feedback-sqlite-qa"><h1>QA FAILED</h1><pre>{error}</pre></main>;
  if (!result || !character) return <main className="combat-feedback-sqlite-qa"><h1>Running Stage 172.5 Tauri/SQLite QA...</h1></main>;
  const totalChecks = result.report.length + (runtimeReport?.length ?? 0);

  return (
    <main className="combat-feedback-sqlite-qa">
      <header>
        <div><span>ISOLATED TAURI / SQLITE + WEBVIEW REPORT</span><h1>Stage 172.5 - Combat Feedback Integrated QA</h1><strong>{runtimeReport ? `${totalChecks}/${totalChecks} checks passed` : `${result.report.length}/${result.report.length} database checks passed / checking WebView`}</strong><p>Database: stage1725_20260906.db. The player save is not opened.</p></div>
        <div className="combat-feedback-sqlite-controls">
          <button className={sceneMode === "hunt" ? "is-active" : ""} onClick={() => setSceneMode("hunt")} type="button">Hunt</button>
          <button className={sceneMode === "boss" ? "is-active" : ""} onClick={() => setSceneMode("boss")} type="button">Boss</button>
          <button className={completed ? "is-active" : ""} onClick={() => setCompleted((value) => !value)} type="button">Completed</button>
          <label><input checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} type="checkbox" /> Reduce motion</label>
        </div>
      </header>

      {sceneMode === "hunt" ? <nav className="combat-feedback-sqlite-vocations">{huntCharacters.map((entry, index) => <button className={index === vocationIndex ? "is-active" : ""} key={entry.id} onClick={() => setVocationIndex(index)} type="button">{entry.vocation}</button>)}</nav> : null}
      <div className="combat-feedback-sqlite-scene" data-scene-mode={sceneMode}>
        {sceneMode === "hunt" ? (
          <HuntScene character={character} hunt={stage1725Hunt} onChangeBossDodgeBehavior={noOp} onChangeDefensiveResponsePriority={noOp} onCollectHunt={noOp} onOpenAction={noOp} onReturnToCity={noOp} onToggleCombatSkill={noOp} />
        ) : (
          <BossScene boss={stage1725Boss} character={character} characters={bossCharacters} party={result.party} onAbortBoss={noOp} onBossManualReaction={noOp} onCollectBoss={noOp} onOpenAction={noOp} />
        )}
      </div>

      <FeedbackProbes result={result} />
      <details><summary>Automated evidence</summary><pre>{[...result.report, ...(runtimeReport ?? [])].join("\n")}</pre></details>
    </main>
  );
}

function FeedbackProbes({ result }: { result: Stage1725QaResult }) {
  const warden = result.huntState.characters.find((character) => character.vocation === "Warden")!;
  const bossActors = result.party.members.map((member) => ({ character: result.bossState.characters.find((character) => character.id === member.characterId)!, role: member.role }));
  return (
    <div aria-hidden="true" className="combat-feedback-sqlite-probes">
      {result.huntState.characters.map((character) => <div className="is-vocation" data-vocation={character.vocation} key={character.id}><CombatFloatingFeedback actors={[{ character }]} elapsedMs={findCriticalElapsed([{ character }], "hunt")} mode="hunt" resolved={false} target={{ x: 96, y: 4 }} /></div>)}
      <div className="is-incoming"><CombatFloatingFeedback actors={[{ character: warden }]} elapsedMs={1_800} mode="hunt" resolved={false} target={{ x: 50, y: 50 }} /></div>
      <div className="is-healing"><CombatFloatingFeedback actors={[{ character: warden }]} elapsedMs={0} mode="hunt" resolved={false} target={{ x: 50, y: 50 }} /></div>
      <div className="is-boss"><CombatFloatingFeedback actors={bossActors} elapsedMs={6_600} mode="boss" resolved={false} target={{ x: 76, y: 43 }} /></div>
      <div className="is-completed-hunt"><CombatFloatingFeedback actors={[{ character: warden }]} elapsedMs={1_800} mode="hunt" resolved target={{ x: 50, y: 50 }} /></div>
      <div className="is-completed-boss"><CombatFloatingFeedback actors={bossActors} elapsedMs={6_600} mode="boss" resolved target={{ x: 76, y: 43 }} /></div>
    </div>
  );
}

async function runRuntimeChecks() {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => { if (!ok) throw new Error(`WEBVIEW FAIL after ${report.length} checks: ${label}`); report.push(`PASS ${label}`); };
  const scene = document.querySelector<HTMLElement>(".combat-feedback-sqlite-scene");
  check(Boolean(scene?.querySelector(".hunt-scene .combat-floating-feedback")), "production Hunt Scene mounts floating feedback");
  check(Number(scene?.querySelector<HTMLElement>(".combat-floating-feedback")?.dataset.feedbackCount) > 0, "active production Hunt Scene renders feedback events");
  const vocationProbes = [...document.querySelectorAll<HTMLElement>(".combat-feedback-sqlite-probes .is-vocation")];
  check(vocationProbes.length === 5, "WebView renders probes for all five vocations");
  check(vocationProbes.every((probe) => Boolean(probe.querySelector('[data-feedback-kind="critical"]'))), "all five vocation cadences render critical feedback");
  check(Boolean(document.querySelector('.combat-feedback-sqlite-probes .is-incoming [data-feedback-kind="incoming"]')), "incoming damage renders in WebView");
  check(Boolean(document.querySelector('.combat-feedback-sqlite-probes .is-healing [data-feedback-kind="healing"]')), "healing renders in WebView");
  const bossProbeKinds = [...document.querySelectorAll<HTMLElement>(".combat-feedback-sqlite-probes .is-boss [data-feedback-kind]")].map((node) => node.dataset.feedbackKind);
  check(bossProbeKinds.includes("incoming") && bossProbeKinds.includes("healing"), "boss party renders incoming and healing feedback");
  check(document.querySelector<HTMLElement>(".is-completed-hunt .combat-floating-feedback")?.dataset.feedbackCount === "0", "completed Hunt Scene contract renders no numbers");
  check(document.querySelector<HTMLElement>(".is-completed-boss .combat-floating-feedback")?.dataset.feedbackCount === "0", "completed Boss Scene contract renders no numbers");
  const numbers = [...document.querySelectorAll<HTMLElement>(".combat-feedback-sqlite-probes .combat-floating-number")];
  check(numbers.length >= 10 && numbers.every((node) => Number(node.textContent?.replace(/\D/g, "")) > 0), "rendered feedback values are positive and readable");
  check(numbers.every((node) => { const x = Number.parseFloat(node.style.getPropertyValue("--feedback-x")); const y = Number.parseFloat(node.style.getPropertyValue("--feedback-y")); return x >= 4 && x <= 96 && y >= 4 && y <= 96; }), "rendered feedback coordinates remain bounded");
  check(numbers.some((node) => getComputedStyle(node).animationName !== "none"), "full-motion feedback animates in Tauri WebView");
  document.documentElement.dataset.clientMotion = "reduced";
  await nextFrame();
  check(numbers.every((node) => getComputedStyle(node).animationName === "none"), "Reduce motion disables every floating-number animation");
  document.documentElement.dataset.clientMotion = "full";
  return report;
}

function withCompletedVisualState(character: Character): Character {
  return { ...character, currentAction: character.currentAction ? { ...character.currentAction, endsAt: "2026-09-06T12:00:00.000Z", offlineCompletedAt: "2026-09-06T12:00:00.000Z", readyToResolve: true } : undefined };
}

function nextFrame() { return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); }

createRoot(document.getElementById("root")!).render(<CombatFeedbackSqliteQaPage />);
