import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ActionAnalyzer } from "../components/action/ActionAnalyzer";
import { hunts } from "../data/hunts";
import { runStage1785Qa, saveStage1785RuntimeReport, stage1785Hunt, type Stage1785QaResult } from "./charmHuntSqliteQa";
import "../styles.css";

function CharmHuntSqliteQaPage() {
  const [result, setResult] = useState<Stage1785QaResult>();
  const [runtimeReport, setRuntimeReport] = useState<string[]>();
  const [error, setError] = useState<string>();
  const handleFailure = (reason: unknown) => {
    const message = String(reason);
    saveStage1785RuntimeReport([`FAIL ${message}`]).catch(() => undefined);
    setError(message);
  };
  useEffect(() => { runStage1785Qa().then(setResult).catch(handleFailure); }, []);
  useEffect(() => {
    if (!result) return undefined;
    const timer = window.setTimeout(() => { runRuntimeChecks().then(async (report) => { await saveStage1785RuntimeReport(report); setRuntimeReport(report); }).catch(handleFailure); }, 850);
    return () => window.clearTimeout(timer);
  }, [result]);
  if (error) return <main className="bestiary-visual-qa"><h1>QA FAILED</h1><pre>{error}</pre></main>;
  if (!result) return <main className="bestiary-visual-qa"><h1>Running Stage 178.5 Tauri/SQLite QA...</h1></main>;
  const totalChecks = result.report.length + (runtimeReport?.length ?? 0);
  return <main className="bestiary-visual-qa charm-hunt-sqlite-qa">
    <header><span>ISOLATED TAURI / SQLITE + WEBVIEW REPORT</span><h1>Stage 178.5 - Charmed Hunt QA</h1><strong>{runtimeReport ? `${totalChecks}/${totalChecks} checks passed` : `${result.report.length}/${result.report.length} database checks passed / checking WebView`}</strong><p>Database: stage1785_20260908.db. The player save is not opened.</p></header>
    <section><h2>{stage1785Hunt.name}: production Action Analyzer</h2><ActionAnalyzer bestiary={result.guild.bestiary} bossParty={{ bossId: "", members: [] }} bosses={[]} character={result.character} characters={[result.character]} hunts={hunts} quests={[]} /></section>
    <details><summary>Automated evidence</summary><pre>{[...result.report, ...(runtimeReport ?? [])].join("\n")}</pre></details>
  </main>;
}

async function runRuntimeChecks() {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => { if (!ok) throw new Error(`WEBVIEW FAIL after ${report.length} checks: ${label}`); report.push(`PASS ${label}`); };
  const panel = document.querySelector<HTMLElement>(".action-analyzer + .charm-status-summary");
  check(document.querySelectorAll(".action-analyzer > div").length > 5, "production Action Analyzer renders active Hunt metrics");
  check(panel?.textContent?.includes("Scavenger") && panel.textContent.includes("Sewer Rat"), "Hunt panel identifies the persisted Charm target");
  check(panel?.textContent?.includes("+5% loot"), "Hunt panel exposes the applied loot bonus");
  check(panel?.textContent?.includes("Charm bonus applied: Scavenger"), "Hunt panel retains the production engine log");
  check(document.documentElement.scrollWidth <= innerWidth, "charmed Hunt WebView has no horizontal overflow");
  return report;
}

createRoot(document.getElementById("root")!).render(<CharmHuntSqliteQaPage />);
