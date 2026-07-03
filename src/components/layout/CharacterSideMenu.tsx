import { GameIconButton } from "../ui/GameIconButton";
import { normalizeDestinyState } from "../../game-engine/destiny/normalizeDestinyState";
import type { Character } from "../../shared/types";
import type { MainPanelTab } from "./MainPanel";

interface CharacterSideMenuProps {
  character: Character;
  activeTab: MainPanelTab;
  onOpenTab: (tab: MainPanelTab) => void;
}

const menuItems: Array<{ tab: MainPanelTab; label: string; icon: string }> = [
  { tab: "character", label: "Details", icon: "D" },
  { tab: "skills", label: "Skills", icon: "S" },
  { tab: "blessings", label: "Bless", icon: "B" },
  { tab: "proficiency", label: "Weapons", icon: "W" },
  { tab: "focus", label: "Focus", icon: "F" },
  { tab: "destiny", label: "Destiny", icon: "P" },
  { tab: "collections", label: "Collect", icon: "C" },
  { tab: "inventory", label: "Bag", icon: "I" },
  { tab: "bestiary", label: "Bestiary", icon: "M" },
];

export function CharacterSideMenu({
  character,
  activeTab,
  onOpenTab,
}: CharacterSideMenuProps) {
  return (
    <nav className="character-side-menu" aria-label="Character systems">
      {menuItems.map((item) => (
        <GameIconButton
          active={activeTab === item.tab}
          badge={getBadge(item.tab, character)}
          icon={item.icon}
          key={item.tab}
          label={item.label}
          onClick={() => onOpenTab(item.tab)}
        />
      ))}
    </nav>
  );
}

function getBadge(tab: MainPanelTab, character: Character) {
  if (tab === "blessings") return character.blessings?.length ? "ON" : "0/1";
  if (tab === "focus") {
    const activeCount = character.monsterFocus?.slots?.filter((slot) => slot.status === "active").length ?? 0;
    return activeCount > 0 ? `${activeCount}` : undefined;
  }
  if (tab === "destiny") {
    const destiny = normalizeDestinyState(character);
    return destiny.availablePoints > 0 ? `${destiny.availablePoints}` : undefined;
  }
  if (tab === "collections") return "New";
  return undefined;
}
