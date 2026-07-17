import { useState } from "react";
import type { Character, Guild, GuildDepot, InventoryItem } from "../../shared/types";
import { GameTabBar } from "../ui/GameTabBar";
import { ForgePanel } from "./ForgePanel";
import { GuildWorkbenchPanel } from "./GuildWorkbenchPanel";
import { SalvageBenchPanel } from "./SalvageBenchPanel";

interface ForgeWorkshopProps {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  onUpgradeItem: (inventoryItem: InventoryItem) => void;
  onIncreaseTier: (inventoryItem: InventoryItem) => void;
  onApplyImbuement: (inventoryItem: InventoryItem, imbuementId: string) => void;
  onRemoveImbuements: (inventoryItem: InventoryItem, imbuementId?: string) => void;
  onCraft: (recipeId: string) => void;
  onSalvage: (inventoryItemId: string) => void;
}

type ForgeWorkshopTab = "enhancement" | "workbench" | "salvage";

export function ForgeWorkshop(props: ForgeWorkshopProps) {
  const [activeTab, setActiveTab] = useState<ForgeWorkshopTab>("enhancement");

  return (
    <div className="forge-workshop-shell">
      <GameTabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        tabs={[
          { id: "enhancement", label: "Enhancement Forge" },
          { id: "workbench", label: "Guild Workbench" },
          { id: "salvage", label: "Salvage Bench" },
        ]}
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
      ) : activeTab === "workbench" ? (
        <GuildWorkbenchPanel depot={props.guildDepot} guild={props.guild} onCraft={props.onCraft} />
      ) : <SalvageBenchPanel depot={props.guildDepot} guild={props.guild} onSalvage={props.onSalvage} />}
    </div>
  );
}
