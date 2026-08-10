import { getBossArenaBackground } from "../../data/bossArenaBackgrounds";
import type { Boss } from "../../shared/types";

export interface BossArenaBackgroundMeta {
  className: string;
  label: string;
  src?: string;
}

export function getBossArenaBackgroundMeta(boss?: Boss): BossArenaBackgroundMeta {
  const registeredArena = getBossArenaBackground(boss?.id);
  if (registeredArena) return registeredArena;

  const text = `${boss?.name ?? ""} ${boss?.description ?? ""} ${(boss?.tags ?? []).join(" ")}`.toLowerCase();
  if (text.includes("ember") || text.includes("dragon") || text.includes("fire")) return { className: "boss-arena-ember", label: "Volcanic arena" };
  if (text.includes("crypt") || text.includes("undead")) return { className: "boss-arena-crypt", label: "Crypt arena" };
  if (text.includes("sewer") || text.includes("spider")) return { className: "boss-arena-sewer", label: "Undercity arena" };
  if (text.includes("camp") || text.includes("troll")) return { className: "boss-arena-camp", label: "War camp" };
  if (text.includes("khazgrim") || text.includes("gate")) return { className: "boss-arena-mountain", label: "Mountain gate" };
  return { className: "boss-arena-default", label: "Guild raid arena" };
}
