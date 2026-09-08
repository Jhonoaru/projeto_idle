import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BestiaryPanel } from "../components/bestiary/BestiaryPanel";
import { runStage1775Qa, saveStage1775RuntimeReport, type Stage1775QaResult } from "./bestiarySqliteQa";
import "../styles.css";

function BestiarySqliteQaPage() {
  const [result, setResult] = useState<Stage1775QaResult>();
  const [runtimeReport, setRuntimeReport] = useState<string[]>();
  const [error, setError] = useState<string>();
  const handleFailure = (reason: unknown) => {
    const message = String(reason);
    saveStage1775RuntimeReport([`FAIL ${message}`]).catch(() => undefined);
    setError(message);
  };
  useEffect(() => { runStage1775Qa().then(setResult).catch(handleFailure); }, []);
  useEffect(() => {
    if (!result) return undefined;
    const timer = window.setTimeout(() => { runRuntimeChecks().then(async (report) => { await saveStage1775RuntimeReport(report); setRuntimeReport(report); }).catch(handleFailure); }, 850);
    return () => window.clearTimeout(timer);
  }, [result]);
  if (error) return <main className="bestiary-visual-qa"><h1>QA FAILED</h1><pre>{error}</pre></main>;
  if (!result) return <main className="bestiary-visual-qa"><h1>Running Stage 177.5 Tauri/SQLite QA...</h1></main>;
  const totalChecks = result.report.length + (runtimeReport?.length ?? 0);
  return <main className="bestiary-visual-qa">
    <header><span>ISOLATED TAURI / SQLITE + WEBVIEW REPORT</span><h1>Stage 177.5 - Bestiary QA</h1><strong>{runtimeReport ? `${totalChecks}/${totalChecks} checks passed` : `${result.report.length}/${result.report.length} database checks passed / checking WebView`}</strong><p>Database: stage1775_20260908.db. The player save is not opened.</p></header>
    <BestiaryPanel character={result.character} guild={result.guild} onAssignCharm={() => undefined} onClaimReward={() => undefined} onOpenFocus={() => undefined} onRemoveCharm={() => undefined} onUnlockCharm={() => undefined} />
    <details><summary>Automated evidence</summary><pre>{[...result.report, ...(runtimeReport ?? [])].join("\n")}</pre></details>
  </main>;
}

async function runRuntimeChecks() {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => { if (!ok) throw new Error(`WEBVIEW FAIL after ${report.length} checks: ${label}`); report.push(`PASS ${label}`); };
  check(document.querySelectorAll(".bestiary-card").length === 3, "production registry renders the three persisted records");
  const dragonCard = [...document.querySelectorAll<HTMLElement>(".bestiary-card")].find((card) => card.textContent?.includes("Dragon Whelp"));
  dragonCard?.click();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  check(document.querySelector(".bestiary-dossier-identity strong")?.textContent === "Dragon Whelp", "completed persisted record opens its dossier");
  const lootEntries = [...document.querySelectorAll<HTMLElement>(".bestiary-loot-grid article")];
  check(lootEntries.length >= 4, "completed dossier renders real persisted loot entries");
  check(document.querySelector(".bestiary-dossier-loot")?.textContent?.includes("0.15%"), "rare drop chance stays legible in WebView");
  const creatureImages = [...document.querySelectorAll<HTMLImageElement>(".bestiary-card-sigil img, .bestiary-dossier-sigil img")];
  await Promise.all(creatureImages.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => image.addEventListener("load", () => resolve(), { once: true }))));
  check(creatureImages.length >= 4 && creatureImages.every((image) => image.naturalWidth > 0), "local creature sprites load in the Tauri WebView");
  check(document.querySelector(".bestiary-card.bestiary-stage-completed")?.textContent?.includes("Scavenger"), "assigned persisted charm is visible on completed record");
  const sewerCard = [...document.querySelectorAll<HTMLElement>(".bestiary-card")].find((card) => card.textContent?.includes("Sewer Rat"));
  sewerCard?.click();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  check(document.querySelector(".bestiary-dossier-identity strong")?.textContent === "Sewer Rat" && document.querySelector(".bestiary-dossier-loot")?.textContent?.includes("Classified"), "started record remains classified when selected");
  check(document.documentElement.scrollWidth <= innerWidth, "Bestiary WebView has no horizontal overflow");
  return report;
}

createRoot(document.getElementById("root")!).render(<BestiarySqliteQaPage />);
