import { useMemo, useState } from "react";
import { craftingRecipes, workshopRankNames } from "../../data/craftingRecipes";
import { items } from "../../data/items";
import { getCraftingAvailability } from "../../game-engine/crafting/getCraftingAvailability";
import { getWorkshopRank } from "../../game-engine/crafting/getWorkshopRank";
import { normalizeGuildCraftingState } from "../../game-engine/crafting/normalizeGuildCraftingState";
import type { CraftingRecipeCategory, Guild, GuildDepot } from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";
import { ItemProgressionBadge } from "../items/ItemProgressionBadge";
import { EquipmentSetBadge } from "../items/EquipmentSetBadge";

interface GuildWorkbenchPanelProps {
  guild: Guild;
  depot: GuildDepot;
  onCraft: (recipeId: string) => void;
}

type RecipeFilter = "all" | CraftingRecipeCategory;

export function GuildWorkbenchPanel({ guild, depot, onCraft }: GuildWorkbenchPanelProps) {
  const [filter, setFilter] = useState<RecipeFilter>("all");
  const [selectedRecipeId, setSelectedRecipeId] = useState(craftingRecipes[0].id);
  const workshop = getWorkshopRank(guild.crafting);
  const crafting = normalizeGuildCraftingState(guild.crafting);
  const filteredRecipes = craftingRecipes.filter((recipe) => filter === "all" || recipe.category === filter);
  const selectedRecipe = filteredRecipes.find((recipe) => recipe.id === selectedRecipeId) ?? filteredRecipes[0] ?? craftingRecipes[0];
  const availability = getCraftingAvailability(guild, depot, selectedRecipe.id);
  const output = items[selectedRecipe.outputItemId];
  const materialCounts = useMemo(() => getDepotMaterialCounts(depot), [depot]);

  return (
    <div className="workbench-panel">
      <section className="workbench-summary">
        <div><span>Workshop Rank</span><strong>{workshop.rank} / {workshop.name}</strong></div>
        <div><span>Completed Orders</span><strong>{crafting.totalCrafts}</strong></div>
        <div><span>Guild Gold</span><strong>{guild.gold.toLocaleString("en-US")}g</strong></div>
        <div><span>Depot Materials</span><strong>{materialCounts.size} indexed</strong></div>
      </section>

      <section className="workbench-rank-track" aria-label={`Workshop Rank ${workshop.rank} of 4`}>
        {([1, 2, 3, 4] as const).map((rank) => (
          <div className={rank < workshop.rank ? "is-complete" : rank === workshop.rank ? "is-current" : ""} key={rank}>
            <span>Rank {rank}</span>
            <strong>{workshopRankNames[rank]}</strong>
          </div>
        ))}
      </section>

      <div className="workbench-progress-note">
        <span>Permanent guild workshop progression</span>
        <strong>{workshop.nextRank ? `${workshop.craftsToNextRank} order(s) to ${workshop.nextRankName}` : "Maximum rank reached"}</strong>
      </div>

      <div className="workbench-filters" aria-label="Recipe filters">
        {(["all", "weapon", "armor"] as RecipeFilter[]).map((option) => (
          <button className={filter === option ? "is-selected" : ""} key={option} onClick={() => setFilter(option)} type="button">
            {option}
          </button>
        ))}
      </div>

      <div className="workbench-layout">
        <section className="workbench-recipe-list" aria-label="Equipment recipes">
          {filteredRecipes.map((recipe) => {
            const recipeOutput = items[recipe.outputItemId];
            const status = getCraftingAvailability(guild, depot, recipe.id);
            return (
              <button
                className={`${selectedRecipe.id === recipe.id ? "is-selected" : ""} ${status.available ? "is-available" : "is-locked"}`}
                key={recipe.id}
                onClick={() => setSelectedRecipeId(recipe.id)}
                type="button"
              >
                <ItemIcon item={recipeOutput} showQuantity={false} size="small" />
                <span><small>Rank {recipe.requiredWorkshopRank} / {recipe.category}</small><strong>{recipe.name}</strong><em>{recipe.goldCost.toLocaleString("en-US")}g</em></span>
              </button>
            );
          })}
        </section>

        <section className="workbench-order">
          <header className="workbench-order-header">
            <ItemIcon item={output} showQuantity={false} size="large" />
            <div>
              <span>Selected blueprint</span>
              <h3>{selectedRecipe.name}</h3>
              <ItemProgressionBadge item={output} />
              <EquipmentSetBadge item={output} />
            </div>
          </header>
          <p>{selectedRecipe.description}</p>

          <div className="workbench-requirements">
            <div className={workshop.rank >= selectedRecipe.requiredWorkshopRank ? "is-ready" : "is-missing"}>
              <span>Workshop</span><strong>Rank {workshop.rank}/{selectedRecipe.requiredWorkshopRank}</strong>
            </div>
            <div className={guild.gold >= selectedRecipe.goldCost ? "is-ready" : "is-missing"}>
              <span>Guild Gold</span><strong>{guild.gold.toLocaleString("en-US")}/{selectedRecipe.goldCost.toLocaleString("en-US")}g</strong>
            </div>
            {selectedRecipe.materials.map((material) => {
              const available = materialCounts.get(material.itemId) ?? 0;
              return (
                <div className={available >= material.quantity ? "is-ready" : "is-missing"} key={material.itemId}>
                  <span>{items[material.itemId]?.name ?? material.itemId}</span><strong>{available}/{material.quantity}</strong>
                </div>
              );
            })}
          </div>

          <div className="workbench-delivery"><span>Delivery</span><strong>Guild Depot / immediate</strong></div>
          <button className="workbench-craft-button" disabled={!availability.available} onClick={() => onCraft(selectedRecipe.id)} type="button">
            {availability.available ? `Craft ${output?.name ?? selectedRecipe.name}` : availability.reason}
          </button>
        </section>

        <aside className="workbench-history">
          <header><span>Workshop ledger</span><strong>Last 20 orders</strong></header>
          {crafting.history.length === 0 ? <p>No equipment crafted yet.</p> : crafting.history.map((entry) => (
            <article key={entry.id}>
              <span>{new Date(entry.craftedAt).toLocaleDateString("en-US")}</span>
              <strong>{entry.itemName}</strong>
              <small>{entry.goldSpent.toLocaleString("en-US")}g / {entry.materialsConsumed} materials</small>
            </article>
          ))}
          <footer><span>Lifetime spent</span><strong>{crafting.totalGoldSpent.toLocaleString("en-US")}g</strong><small>{crafting.totalMaterialsConsumed} materials consumed</small></footer>
        </aside>
      </div>
    </div>
  );
}

function getDepotMaterialCounts(depot: GuildDepot) {
  const counts = new Map<string, number>();
  for (const item of depot.items) {
    if (item.locked || item.item.type === "quest") continue;
    if (item.item.type !== "material" && item.item.type !== "creature_product") continue;
    counts.set(item.itemId, (counts.get(item.itemId) ?? 0) + Math.max(0, Math.floor(item.quantity)));
  }
  return counts;
}
