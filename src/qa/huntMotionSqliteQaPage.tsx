import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { HuntScene } from "../components/hunt-scene/HuntScene";
import { HuntSceneActor } from "../components/hunt-scene/HuntSceneActor";
import { hunts } from "../data/hunts";
import type { Character } from "../shared/types";
import { runStage1705Qa, saveStage1705RuntimeReport, type Stage1705QaResult } from "./huntMotionSqliteQa";
import "../styles.css";

type SceneMode = "active" | "completed";
const actorPhases = ["windup", "striking", "recoiling", "recovering", "striking"] as const;
const targetPositions = ["top-left", "top-right", "left", "right", "bottom-right"];
const noOp = () => undefined;

function HuntMotionSqliteQaPage() {
  const [result, setResult] = useState<Stage1705QaResult>();
  const [runtimeReport, setRuntimeReport] = useState<string[]>();
  const [error, setError] = useState<string>();
  const [selectedId, setSelectedId] = useState("");
  const [sceneMode, setSceneMode] = useState<SceneMode>("active");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    runStage1705Qa().then((nextResult) => {
      setResult(nextResult);
      setSelectedId(nextResult.state.characters[0]?.id ?? "");
    }).catch((reason) => setError(String(reason)));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.clientMotion = reduceMotion ? "reduced" : "full";
  }, [reduceMotion]);

  useEffect(() => {
    if (!result) return undefined;
    const timer = window.setTimeout(() => {
      runRuntimeChecks().then(async (report) => {
        await saveStage1705RuntimeReport(report);
        setRuntimeReport(report);
      }).catch((reason) => setError(String(reason)));
    }, 1_000);
    return () => window.clearTimeout(timer);
  }, [result]);

  const selected = result?.state.characters.find((character) => character.id === selectedId) ?? result?.state.characters[0];
  const displayCharacter = useMemo(
    () => selected && sceneMode === "completed" ? withCompletedVisualState(selected) : selected,
    [sceneMode, selected],
  );

  if (error) return <main className="hunt-motion-sqlite-qa"><h1>QA FAILED</h1><pre>{error}</pre></main>;
  if (!result || !displayCharacter) return <main className="hunt-motion-sqlite-qa"><h1>Running Stage 170.5 Tauri/SQLite QA...</h1></main>;

  const totalChecks = result.report.length + (runtimeReport?.length ?? 0);
  return (
    <main className="hunt-motion-sqlite-qa">
      <header>
        <div>
          <span>ISOLATED TAURI / SQLITE + WEBVIEW REPORT</span>
          <h1>Stage 170.5 - Hunt Motion Integrated QA</h1>
          <strong>{runtimeReport ? `${totalChecks}/${totalChecks} checks passed` : `${result.report.length}/${result.report.length} database checks passed / checking WebView`}</strong>
          <p>Database: stage1705_20260904.db. The player save is not opened.</p>
        </div>
        <div className="hunt-motion-sqlite-controls">
          <button className={sceneMode === "active" ? "is-active" : ""} onClick={() => setSceneMode("active")} type="button">Active</button>
          <button className={sceneMode === "completed" ? "is-active" : ""} onClick={() => setSceneMode("completed")} type="button">Completed</button>
          <label><input checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} type="checkbox" /> Reduce motion</label>
        </div>
      </header>

      <nav className="hunt-motion-sqlite-vocations" aria-label="Vocation motion matrix">
        {result.state.characters.map((character, index) => (
          <button className={character.id === displayCharacter.id ? "is-selected" : ""} key={character.id} onClick={() => setSelectedId(character.id)} type="button">
            <div className="hunt-motion-sqlite-actor-stage">
              <HuntSceneActor character={character} actionText={actorPhases[index]} motionPhase={actorPhases[index]} targetPosition={targetPositions[index]} />
            </div>
            <strong>{character.vocation}</strong>
            <span>{actorPhases[index]}</span>
          </button>
        ))}
      </nav>

      <div className="hunt-motion-sqlite-scene" data-scene-mode={sceneMode}>
        <HuntScene
          character={displayCharacter}
          hunt={hunts[0]}
          onChangeBossDodgeBehavior={noOp}
          onChangeDefensiveResponsePriority={noOp}
          onCollectHunt={noOp}
          onOpenAction={noOp}
          onReturnToCity={noOp}
          onToggleCombatSkill={noOp}
        />
      </div>

      <div aria-hidden="true" className="hunt-motion-sqlite-probe">
        <HuntScene
          character={withCompletedVisualState(result.state.characters[0])}
          hunt={hunts[0]}
          onChangeBossDodgeBehavior={noOp}
          onChangeDefensiveResponsePriority={noOp}
          onCollectHunt={noOp}
          onOpenAction={noOp}
          onReturnToCity={noOp}
          onToggleCombatSkill={noOp}
        />
      </div>

      <details>
        <summary>Automated evidence</summary>
        <pre>{[...result.report, ...(runtimeReport ?? [])].join("\n")}</pre>
      </details>
    </main>
  );
}

async function runRuntimeChecks() {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => {
    if (!ok) throw new Error(`WEBVIEW FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  };

  const selectedScene = document.querySelector<HTMLElement>(".hunt-motion-sqlite-scene");
  const activeActor = selectedScene?.querySelector<HTMLElement>(".hunt-scene-character");
  const activeCreatures = [...(selectedScene?.querySelectorAll<HTMLElement>(".hunt-scene-creature") ?? [])];
  check(document.querySelectorAll(".hunt-motion-sqlite-vocations .hunt-scene-character").length === 5, "WebView renders all five vocation actors");
  check(Boolean(activeActor?.dataset.motionPhase), "active Hunt Scene exposes actor motion phase");
  check(activeCreatures.length === 3 && activeCreatures.every((creature) => Boolean(creature.dataset.motionPhase)), "active Hunt Scene exposes three creature phases");
  const activeStyle = activeActor?.querySelector(".hunt-scene-character-core") ? getComputedStyle(activeActor.querySelector(".hunt-scene-character-core")!) : undefined;
  check(activeStyle?.animationName !== "none" || activeStyle.transform !== "none", "active actor has motion in Tauri WebView");
  const loadedImages = [...document.querySelectorAll<HTMLImageElement>("img")];
  check(loadedImages.length >= 9 && loadedImages.every((image) => image.complete && image.naturalWidth > 0), "local hero and creature PNGs decode in WebView");
  const completedProbe = document.querySelector(".hunt-motion-sqlite-probe");
  check(completedProbe?.querySelector<HTMLElement>(".hunt-scene-character")?.dataset.motionPhase === "resolved", "completed Hunt Scene resolves actor motion");
  check([...completedProbe!.querySelectorAll<HTMLElement>(".hunt-scene-creature")].every((creature) => creature.dataset.motionPhase === "defeated"), "completed Hunt Scene resolves all creatures as defeated");

  document.documentElement.dataset.clientMotion = "reduced";
  await nextFrame();
  const reducedActorStyle = getComputedStyle(activeActor!.querySelector(".hunt-scene-character-core")!);
  const reducedCreatureStyles = activeCreatures.map((creature) => getComputedStyle(creature.querySelector(".hunt-creature-token")!));
  check(reducedActorStyle.animationName === "none" && reducedActorStyle.transform === "none", "Reduce motion stops actor animation and displacement");
  check(reducedCreatureStyles.every((style) => style.animationName === "none" && style.transform === "none"), "Reduce motion stops creature animation and displacement");
  document.documentElement.dataset.clientMotion = "full";
  return report;
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

function withCompletedVisualState(character: Character): Character {
  return {
    ...character,
    status: "hunting",
    currentAction: character.currentAction ? {
      ...character.currentAction,
      endsAt: "2026-09-04T12:00:00.000Z",
      offlineCompletedAt: "2026-09-04T12:00:00.000Z",
      readyToResolve: true,
    } : undefined,
  };
}

createRoot(document.getElementById("root")!).render(<HuntMotionSqliteQaPage />);
