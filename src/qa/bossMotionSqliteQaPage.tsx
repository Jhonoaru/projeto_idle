import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BossScene } from "../components/boss-scene/BossScene";
import type { Character } from "../shared/types";
import { runStage1715Qa, saveStage1715RuntimeReport, stage1715Boss, type Stage1715QaResult } from "./bossMotionSqliteQa";
import "../styles.css";

type SceneMode = "active" | "completed";
const noOp = () => undefined;

function BossMotionSqliteQaPage() {
  const [result, setResult] = useState<Stage1715QaResult>();
  const [runtimeReport, setRuntimeReport] = useState<string[]>();
  const [error, setError] = useState<string>();
  const [sceneMode, setSceneMode] = useState<SceneMode>("active");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    runStage1715Qa().then(setResult).catch((reason) => setError(String(reason)));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.clientMotion = reduceMotion ? "reduced" : "full";
  }, [reduceMotion]);

  useEffect(() => {
    if (!result) return undefined;
    const timer = window.setTimeout(() => {
      runRuntimeChecks().then(async (report) => {
        await saveStage1715RuntimeReport(report);
        setRuntimeReport(report);
      }).catch((reason) => setError(String(reason)));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [result]);

  const completedCharacters = useMemo(() => result?.state.characters.map(withCompletedVisualState) ?? [], [result]);
  const telegraphCharacters = useMemo(() => withTelegraphVisualState(result?.state.characters ?? []), [result]);
  const displayCharacters = sceneMode === "completed" ? completedCharacters : result?.state.characters ?? [];
  const displayCharacter = displayCharacters[0];

  if (error) return <main className="boss-motion-sqlite-qa"><h1>QA FAILED</h1><pre>{error}</pre></main>;
  if (!result || !displayCharacter) return <main className="boss-motion-sqlite-qa"><h1>Running Stage 171.5 Tauri/SQLite QA...</h1></main>;

  const totalChecks = result.report.length + (runtimeReport?.length ?? 0);
  return (
    <main className="boss-motion-sqlite-qa">
      <header>
        <div>
          <span>ISOLATED TAURI / SQLITE + WEBVIEW REPORT</span>
          <h1>Stage 171.5 - Boss Motion Integrated QA</h1>
          <strong>{runtimeReport ? `${totalChecks}/${totalChecks} checks passed` : `${result.report.length}/${result.report.length} database checks passed / checking WebView`}</strong>
          <p>Database: stage1715_20260905.db. The player save is not opened.</p>
        </div>
        <div className="boss-motion-sqlite-controls">
          <button className={sceneMode === "active" ? "is-active" : ""} onClick={() => setSceneMode("active")} type="button">Active</button>
          <button className={sceneMode === "completed" ? "is-active" : ""} onClick={() => setSceneMode("completed")} type="button">Completed</button>
          <label><input checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} type="checkbox" /> Reduce motion</label>
        </div>
      </header>

      <section className="boss-motion-sqlite-party" aria-label="Persisted party matrix">
        {result.party.members.map((member) => {
          const character = result.state.characters.find((entry) => entry.id === member.characterId)!;
          return <article key={member.characterId}><strong>{character.vocation}</strong><span>{character.name} / {member.role}</span></article>;
        })}
      </section>

      <div className="boss-motion-sqlite-scene" data-scene-mode={sceneMode}>
        <BossScene boss={stage1715Boss} character={displayCharacter} characters={displayCharacters} party={result.party} onAbortBoss={noOp} onBossManualReaction={noOp} onCollectBoss={noOp} onOpenAction={noOp} />
      </div>

      <div aria-hidden="true" className="boss-motion-sqlite-probe is-telegraph">
        <BossScene boss={stage1715Boss} character={telegraphCharacters[0]} characters={telegraphCharacters} party={result.party} onAbortBoss={noOp} onBossManualReaction={noOp} onCollectBoss={noOp} onOpenAction={noOp} />
      </div>
      <div aria-hidden="true" className="boss-motion-sqlite-probe is-completed">
        <BossScene boss={stage1715Boss} character={completedCharacters[0]} characters={completedCharacters} party={result.party} onAbortBoss={noOp} onBossManualReaction={noOp} onCollectBoss={noOp} onOpenAction={noOp} />
      </div>

      <details><summary>Automated evidence</summary><pre>{[...result.report, ...(runtimeReport ?? [])].join("\n")}</pre></details>
    </main>
  );
}

async function runRuntimeChecks() {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => {
    if (!ok) throw new Error(`WEBVIEW FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  };

  const scene = document.querySelector<HTMLElement>(".boss-motion-sqlite-scene");
  const boss = scene?.querySelector<HTMLElement>(".boss-scene-boss-actor");
  const party = [...(scene?.querySelectorAll<HTMLElement>(".boss-scene-party-member") ?? [])];
  check(Boolean(boss?.dataset.motionPhase), "active Boss Scene exposes boss motion phase");
  check(party.length === 5 && party.every((member) => Boolean(member.dataset.motionPhase)), "active Boss Scene exposes five party motion phases");
  check(new Set(party.map((member) => member.dataset.motionPhase)).size >= 3, "active party renders at least three staggered phases");
  const bossStyle = getComputedStyle(boss!.querySelector(".boss-scene-boss-core")!);
  const partyStyles = party.map((member) => getComputedStyle(member.querySelector(".boss-scene-party-core")!));
  check(bossStyle.animationName !== "none" && partyStyles.some((style) => style.animationName !== "none"), "boss and party animate in Tauri WebView");
  const loadedImages = [...scene!.querySelectorAll<HTMLImageElement>("img")];
  check(loadedImages.length >= 7 && loadedImages.every((image) => image.complete && image.naturalWidth > 0), "boss, arena and five hero images decode in WebView");

  const telegraphProbe = document.querySelector(".boss-motion-sqlite-probe.is-telegraph");
  check(Boolean(telegraphProbe?.querySelector(".boss-ability-telegraph")), "controlled probe renders production boss telegraph");
  check([...telegraphProbe!.querySelectorAll<HTMLElement>(".boss-scene-party-member")].some((member) => member.dataset.motionPhase === "dodging" || member.dataset.motionPhase === "guarding"), "telegraph target receives dodge or hold motion");
  const completedProbe = document.querySelector(".boss-motion-sqlite-probe.is-completed");
  check(completedProbe?.querySelector<HTMLElement>(".boss-scene-boss-actor")?.dataset.motionPhase === "defeated", "completed raid defeats boss motion");
  check([...completedProbe!.querySelectorAll<HTMLElement>(".boss-scene-party-member")].every((member) => member.dataset.motionPhase === "victorious"), "completed raid makes all party members victorious");

  document.documentElement.dataset.clientMotion = "reduced";
  await nextFrame();
  const reducedBossStyle = getComputedStyle(boss!.querySelector(".boss-scene-boss-core")!);
  const reducedPartyStyles = party.map((member) => getComputedStyle(member.querySelector(".boss-scene-party-core")!));
  check(reducedBossStyle.animationName === "none" && reducedBossStyle.transform === "none", "Reduce motion stops boss animation and displacement");
  check(reducedPartyStyles.every((style) => style.animationName === "none" && style.transform === "none"), "Reduce motion stops all party animation and displacement");
  document.documentElement.dataset.clientMotion = "full";
  return report;
}

function withCompletedVisualState(character: Character): Character {
  return {
    ...character,
    status: "bossing",
    currentAction: character.currentAction ? { ...character.currentAction, endsAt: "2026-09-05T12:00:00.000Z", offlineCompletedAt: "2026-09-05T12:00:00.000Z", readyToResolve: true } : undefined,
  };
}

function withTelegraphVisualState(characters: Character[]) {
  const startedAt = Date.now() - 9_000;
  return characters.map((character): Character => ({
    ...character,
    status: "bossing",
    currentAction: character.currentAction ? { ...character.currentAction, startedAt: new Date(startedAt).toISOString(), endsAt: new Date(startedAt + 300_000).toISOString(), readyToResolve: false } : undefined,
  }));
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

createRoot(document.getElementById("root")!).render(<BossMotionSqliteQaPage />);
