import { useState } from "react";
import type { Character, Guild, GuildDepot, InventoryItem } from "../../shared/types";
import { GameTabBar } from "../ui/GameTabBar";
import { ForgePanel } from "./ForgePanel";
import { GuildWorkbenchPanel } from "./GuildWorkbenchPanel";

interface ForgeWorkshopProps {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  onUpgradeItem: (inventoryItem: InventoryItem) => void;
  onIncreaseTier: (inventoryItem: InventoryItem) => void;
  onApplyImbuement: (inventoryItem: InventoryItem, imbuementId: string) => void;
  onRemoveImbuements: (inventoryItem: InventoryItem, imbuementId?: string) => void;
  onCraft: (recipeId: string) => void;
}

type ForgeWorkshopTab = "enhancement" | "workbench";

export function ForgeWorkshop(props: ForgeWorkshopProps) {
  const [activeTab, setActiveTab] = useState<ForgeWorkshopTab>("enhancement");

  return (
    <div className="forge-workshop-shell">
      <GameTabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        tabs={[{ id: "enhancement", label: "Enhancement Forge" }, { id: "workbench", label: "Guild Workbench" }]}
      />
      {activeTab === "enhancement" ? (
        <ForgePanel
          character={props.character}
          guild={props.guild}
          guildDepot={props.guildDepot}
          onApplyImbuement={props.onApplyImbuement}
          onIncreaseTier={props.onIncreaseTier}
          onRemoveImbuements={props.onRemoveImbuements}
          onUpgradeItem={props.onUpgradeItem}
        />
      ) : <GuildWorkbenchPanel depot={props.guildDepot} guild={props.guild} onCraft={props.onCraft} />}
    </div>
  );
}
