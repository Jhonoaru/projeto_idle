import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { CharacterSprite } from "../components/characters/CharacterSprite";
import { HuntSceneActor } from "../components/hunt-scene/HuntSceneActor";
import type { Character } from "../shared/types";
import { runStage1755Qa, saveStage1755RuntimeReport, type Stage1755QaResult } from "./characterLoadoutSqliteQa";
import "../styles.css";

function CharacterLoadoutSqliteQaPage() {
  const [result, setResult] = useState<Stage1755QaResult>();
  const [runtimeReport, setRuntimeReport] = useState<string[]>();
  const [error, setError] = useState<string>();

  useEffect(() => { runStage1755Qa().then(setResult).catch((reason) => setError(String(reason))); }, []);
  useEffect(() => {
    if (!result) return undefined;
    const timer = window.setTimeout(() => {
      runRuntimeChecks().then(async (report) => { await saveStage1755RuntimeReport(report); setRuntimeReport(report); }).catch((reason) => setError(String(reason)));
    }, 850);
    return () => window.clearTimeout(timer);
  }, [result]);

  const fallbackCharacter = useMemo(() => result ? withMissingWeaponSprite(result.character) : undefined, [result]);
  if (error) return <main className="loadout-sqlite-qa"><h1>QA FAILED</h1><pre>{error}</pre></main>;
  if (!result || !fallbackCharacter) return <main className="loadout-sqlite-qa"><h1>Running Stage 175.5 Tauri/SQLite QA...</h1></main>;
  const totalChecks = result.report.length + (runtimeReport?.length ?? 0);

  return <main className="loadout-sqlite-qa">
    <header><span>ISOLATED TAURI / SQLITE + WEBVIEW REPORT</span><h1>Stage 175.5 - Character Loadout Visual QA</h1><strong>{runtimeReport ? `${totalChecks}/${totalChecks} checks passed` : `${result.report.length}/${result.report.length} database checks passed / checking WebView`}</strong><p>Database: stage1755_20260907.db. The player save is not opened.</p></header>
    <section className="loadout-qa-profile"><h2>Character Details portrait</h2><CharacterSprite character={result.character} showLoadout size="large" /></section>
    <section className="loadout-qa-hunt"><h2>Hunt Scene actor</h2><div><HuntSceneActor actionText="Attacking" character={result.character} motionPhase="striking" targetPosition="right" /></div></section>
    <section className="loadout-qa-fallback"><h2>Missing item sprite fallback</h2><CharacterSprite character={fallbackCharacter} showLoadout size="large" /></section>
    <details><summary>Automated evidence</summary><pre>{[...result.report, ...(runtimeReport ?? [])].join("\n")}</pre></details>
  </main>;
}

async function runRuntimeChecks() {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => { if (!ok) throw new Error(`WEBVIEW FAIL after ${report.length} checks: ${label}`); report.push(`PASS ${label}`); };
  const profile = document.querySelector<HTMLElement>(".loadout-qa-profile .character-sprite");
  const loadoutItems = [...document.querySelectorAll<HTMLElement>(".loadout-qa-profile .character-loadout-item")];
  check(Boolean(profile?.classList.contains("has-loadout")), "production CharacterSprite enables loadout composition");
  check(loadoutItems.length === 3, "profile renders weapon, offhand and armor markers");
  check(profile?.getAttribute("aria-label")?.includes("Cryptsteel Blade, Brass Shield, Dragonscale Armor"), "portrait accessibility label names equipped loadout");
  check(loadoutItems.some((item) => item.classList.contains("loadout-weapon") && item.classList.contains("item-rarity-rare") && item.querySelector("em")?.textContent === "T2"), "rare weapon keeps slot, rarity and tier marker");
  check(loadoutItems.some((item) => item.classList.contains("loadout-offhand") && item.classList.contains("item-rarity-uncommon") && item.querySelector("em")?.textContent === "T1"), "uncommon offhand keeps slot, rarity and tier marker");
  check(loadoutItems.some((item) => item.classList.contains("loadout-armor") && item.classList.contains("item-rarity-epic") && item.querySelector("em")?.textContent === "T3"), "epic armor keeps slot, rarity and tier marker");
  const images = [...document.querySelectorAll<HTMLImageElement>(".loadout-qa-profile .character-loadout-item img")];
  await Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => image.addEventListener("load", () => resolve(), { once: true }))));
  check(images.length === 3 && images.every((image) => image.naturalWidth > 0), "local equipped item PNGs load in the Tauri WebView");
  const hunt = document.querySelector<HTMLElement>(".loadout-qa-hunt .hunt-scene-character");
  check(hunt?.dataset.motionPhase === "striking" && hunt.querySelectorAll(".character-loadout-item").length === 3, "production HuntSceneActor renders the same loadout composition");
  const fallback = document.querySelector<HTMLElement>(".loadout-qa-fallback .character-sprite");
  check(fallback?.querySelector(".loadout-weapon b")?.textContent === "W" && !fallback?.querySelector(".loadout-weapon img"), "missing weapon sprite falls back to a visible slot marker");
  check(document.documentElement.scrollWidth <= innerWidth, "loadout visual QA has no horizontal overflow");
  return report;
}

function withMissingWeaponSprite(character: Character): Character {
  const weapon = character.equipment.weapon!;
  return { ...character, equipment: { ...character.equipment, weapon: { ...weapon, item: { ...weapon.item, id: "qa-missing-loadout-sprite", name: "Missing Weapon" } } } };
}

createRoot(document.getElementById("root")!).render(<CharacterLoadoutSqliteQaPage />);
