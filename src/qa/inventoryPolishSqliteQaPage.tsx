import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { EquipmentPanel } from "../components/equipment/EquipmentPanel";
import { InventoryGrid } from "../components/inventory/InventoryGrid";
import type { Character, InventoryItem } from "../shared/types";
import { runStage1745Qa, saveStage1745RuntimeReport, type Stage1745QaResult } from "./inventoryPolishSqliteQa";
import "../styles.css";

function InventoryPolishSqliteQaPage() {
  const [result, setResult] = useState<Stage1745QaResult>();
  const [character, setCharacter] = useState<Character>();
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [runtimeReport, setRuntimeReport] = useState<string[]>();
  const [error, setError] = useState<string>();

  useEffect(() => { runStage1745Qa().then((value) => { setResult(value); setCharacter(value.character); }).catch((reason) => setError(String(reason))); }, []);
  useEffect(() => {
    if (!result || !character) return undefined;
    const timer = window.setTimeout(() => {
      runRuntimeChecks().then(async (report) => { await saveStage1745RuntimeReport(report); setRuntimeReport(report); }).catch((reason) => setError(String(reason)));
    }, 850);
    return () => window.clearTimeout(timer);
  }, [result]);

  const equippedItemIds = useMemo(() => new Set(Object.values(character?.equipment ?? {}).flatMap((item) => item ? [item.id] : [])), [character]);
  if (error) return <main className="inventory-sqlite-qa"><h1>QA FAILED</h1><pre>{error}</pre></main>;
  if (!result || !character) return <main className="inventory-sqlite-qa"><h1>Running Stage 174.5 Tauri/SQLite QA...</h1></main>;
  const totalChecks = result.report.length + (runtimeReport?.length ?? 0);

  return <main className="inventory-sqlite-qa">
    <header><div><span>ISOLATED TAURI / SQLITE + WEBVIEW REPORT</span><h1>Stage 174.5 - Inventory Polish Integrated QA</h1><strong>{runtimeReport ? `${totalChecks}/${totalChecks} checks passed` : `${result.report.length}/${result.report.length} database checks passed / checking WebView`}</strong><p>Database: stage1745_20260907.db. The player save is not opened.</p></div></header>
    <section><h2>Inventory</h2><InventoryGrid equippedItemIds={equippedItemIds} items={character.inventory} onSelectItem={(item) => setSelectedItemId(item.id)} selectedItemId={selectedItemId} /></section>
    <section className="inventory-sqlite-equipment"><h2>Equipment</h2><EquipmentPanel character={character} onUnequip={(slot) => setCharacter((current) => current ? { ...current, equipment: { ...current.equipment, [slot]: undefined } } : current)} /></section>
    <details><summary>Automated evidence</summary><pre>{[...result.report, ...(runtimeReport ?? [])].join("\n")}</pre></details>
  </main>;
}

async function runRuntimeChecks() {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => { if (!ok) throw new Error(`WEBVIEW FAIL after ${report.length} checks: ${label}`); report.push(`PASS ${label}`); };
  const slots = [...document.querySelectorAll<HTMLButtonElement>(".inventory-sqlite-qa .inventory-grid button.item-slot")];
  check(slots.length === 6, "production InventoryGrid renders six SQL-loaded items");
  check(slots.every((slot) => slot.getAttribute("aria-label")?.includes("x")), "inventory slots expose quantity and identity to assistive technology");
  const locked = slots.find((slot) => slot.querySelector(".item-icon.is-locked"));
  check(Boolean(locked) && locked?.textContent?.includes("Rat Tail"), "locked stack renders with production locked icon");
  check(locked?.textContent?.includes("x9999"), "locked stack keeps 9999 quantity visible");
  const legendary = slots.find((slot) => slot.textContent?.includes("Emberheart Amulet"));
  check(Boolean(legendary?.querySelector(".item-tier-mark")) && legendary?.textContent?.includes("Legendary"), "legendary T3 item keeps tier and rarity label");
  slots[2].focus();
  await nextFrame();
  check(document.activeElement === slots[2] && document.querySelectorAll(".inventory-grid-active-tooltip .item-tooltip").length === 1, "keyboard focus opens one stable inspection panel");
  slots[2].click();
  await nextFrame();
  check(slots[2].getAttribute("aria-pressed") === "true" && slots[2].classList.contains("is-selected"), "click selection persists on the production slot");
  check(getComputedStyle(slots[2]).outlineStyle !== "none", "selected slot has a visible selection outline");
  const equippedBefore = document.querySelectorAll(".inventory-sqlite-equipment button").length;
  document.querySelector<HTMLButtonElement>(".inventory-sqlite-equipment button")?.click();
  await nextFrame();
  check(document.querySelectorAll(".inventory-sqlite-equipment button").length === equippedBefore - 1, "equipment remove callback updates production panel");
  check([...document.querySelectorAll(".equipment-slot em")].some((node) => node.textContent === "vazio"), "removed equipment slot shows empty state");
  check(document.documentElement.scrollWidth <= innerWidth, "inventory QA has no horizontal overflow");
  return report;
}

function nextFrame() { return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); }

createRoot(document.getElementById("root")!).render(<InventoryPolishSqliteQaPage />);
