import { GameIconButton } from "../ui/GameIconButton";
import { normalizeCollectionsState } from "../../game-engine/collections/normalizeCollectionsState";
import { normalizeDestinyState } from "../../game-engine/destiny/normalizeDestinyState";
import { blessings } from "../../data/blessings";
import type { Character, Guild } from "../../shared/types";
import type { MainPanelTab } from "./MainPanel";

interface CharacterSideMenuProps {
  character: Character;
  guild: Guild;
  activeTab: MainPanelTab;
  onOpenTab: (tab: MainPanelTab) => void;
}

const menuItems: Array<{ tab: MainPanelTab; label: string; icon: string }> = [
  { tab: "character", label: "Details", icon: "D" },
  { tab: "headquarters", label: "Guild", icon: "H" },
  { tab: "contracts", label: "Contracts", icon: "C" },
  { tab: "staff", label: "Staff", icon: "S" },
  { tab: "treasury", label: "Treasury", icon: "G" },
  { tab: "projects", label: "Projects", icon: "P" },
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
  guild,
  activeTab,
  onOpenTab,
}: CharacterSideMenuProps) {
  return (
    <nav className="character-side-menu" aria-label="Character systems">
      {menuItems.map((item) => (
        <GameIconButton
          active={activeTab === item.tab}
          badge={getBadge(item.tab, character, guild)}
          icon={item.icon}
          key={item.tab}
          label={item.label}
          onClick={() => onOpenTab(item.tab)}
        />
      ))}
    </nav>
  );
}

function getBadge(tab: MainPanelTab, character: Character, guild: Guild) {
  if (tab === "blessings") {
    const activeCount = blessings.filter((blessing) => character.blessings?.includes(blessing.id)).length;
    return `${activeCount}/${blessings.length}`;
  }
  if (tab === "focus") {
    const activeCount = character.monsterFocus?.slots?.filter((slot) => slot.status === "active").length ?? 0;
    return activeCount > 0 ? `${activeCount}` : undefined;
  }
  if (tab === "destiny") {
    const destiny = normalizeDestinyState(character);
    return destiny.availablePoints > 0 ? `${destiny.availablePoints}` : undefined;
  }
  if (tab === "collections") {
    const newCount = normalizeCollectionsState(guild.collections).newlyUnlockedCollectionItemIds.length;
    return newCount > 0 ? `${newCount}` : undefined;
  }
  return undefined;
}
