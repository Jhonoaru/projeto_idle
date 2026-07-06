import type { HuntArea } from "../../shared/types";

export interface HuntSceneBackgroundMeta {
  className: string;
  label: string;
}

export function getHuntSceneBackgroundMeta(hunt?: HuntArea): HuntSceneBackgroundMeta {
  const text = `${hunt?.name ?? ""} ${hunt?.description ?? ""} ${(hunt?.tags ?? []).join(" ")}`.toLowerCase();

  if (text.includes("forest") || text.includes("wood") || text.includes("troll")) {
    return { className: "scene-forest", label: "Forest route" };
  }

  if (text.includes("cave") || text.includes("sewer") || text.includes("tunnel")) {
    return { className: "scene-cave", label: "Cavern route" };
  }

  if (text.includes("mud") || text.includes("swamp") || text.includes("poison")) {
    return { className: "scene-swamp", label: "Swamp route" };
  }

  if (text.includes("hill") || text.includes("khazgrim") || text.includes("dwarf")) {
    return { className: "scene-mountain", label: "Mountain route" };
  }

  if (text.includes("crypt") || text.includes("dungeon") || text.includes("cult")) {
    return { className: "scene-dungeon", label: "Dungeon route" };
  }

  return { className: "scene-default", label: "Hunt route" };
}
