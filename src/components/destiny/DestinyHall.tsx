import { useEffect, useMemo, useState } from "react";
import { destinyNodes, getDestinyNodeById } from "../../data/destinyNodes";
import { calculateDestinyBonuses, formatDestinyBonusSummary } from "../../game-engine/destiny/calculateDestinyBonuses";
import { canUnlockDestinyNode } from "../../game-engine/destiny/canUnlockDestinyNode";
import { getDestinyResetCost } from "../../game-engine/destiny/resetDestinyPath";
import { getVisibleDestinyNodes, normalizeDestinyState } from "../../game-engine/destiny/normalizeDestinyState";
import type { Character, DestinyBonus, DestinyNode, DestinyNodeCategory } from "../../shared/types";

interface DestinyHallProps {
  character: Character;
  onReset: () => void;
  onUnlock: (nodeId: string) => void;
}

const categoryLabels: Record<DestinyNodeCategory, string> = {
  core: "Core path",
  offense: "Offense",
  defense: "Defense",
  utility: "Utility",
  vocation: "Vocation path",
};

const hallPositions: Record<string, { x: number; y: number }> = {
  "destiny-adventurers-will": { x: 40, y: 50 },
  "destiny-battle-instinct": { x: 40, y: 23 },
  "destiny-survival-habit": { x: 40, y: 77 },
  "destiny-efficient-packing": { x: 15, y: 50 },
  "destiny-hunters-routine": { x: 15, y: 23 },
  "destiny-treasure-sense": { x: 15, y: 77 },
  "destiny-veteran-adventurer": { x: 65, y: 50 },
};

export function DestinyHall({ character, onReset, onUnlock }: DestinyHallProps) {
  const destiny = normalizeDestinyState(character);
  const visibleNodes = useMemo(() => getVisibleDestinyNodes(character.vocation), [character.vocation]);
  const initialNode = findInitialNode(character, visibleNodes);
  const [selectedNodeId, setSelectedNodeId] = useState(initialNode?.id ?? "");
  const selectedNode = visibleNodes.find((node) => node.id === selectedNodeId) ?? initialNode;
  const selectedStatus = selectedNode
    ? canUnlockDestinyNode({ ...character, destiny }, selectedNode.id)
    : { canUnlock: false, reason: "No node selected." };
  const activeBonuses = calculateDestinyBonuses({ ...character, destiny });
  const resetCost = getDestinyResetCost({ ...character, destiny });
  const completionPercent = Math.round((destiny.unlockedNodeIds.length / Math.max(1, visibleNodes.length)) * 100);

  useEffect(() => {
    if (!visibleNodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(findInitialNode(character, visibleNodes)?.id ?? "");
    }
  }, [character.id, selectedNodeId, visibleNodes]);

  return (
    <div className="destiny-hall">
      <section className="destiny-hall-hero">
        <div className="destiny-hall-seal" aria-hidden="true"><i /><span>{getVocationSigil(character.vocation)}</span></div>
        <div className="destiny-hall-identity">
          <span>Personal progression archive</span>
          <h3>{character.name}'s Path of Destiny</h3>
          <p>{character.vocation} / Level {character.level} / {character.city}</p>
        </div>
        <div className="destiny-hall-summary">
          <SummaryStat label="Available points" value={`${destiny.availablePoints}`} />
          <SummaryStat label="Spent / earned" value={`${destiny.spentPoints} / ${destiny.totalEarnedPoints}`} />
          <SummaryStat label="Path completion" value={`${completionPercent}%`} />
          <SummaryStat label="Unlocked nodes" value={`${destiny.unlockedNodeIds.length}/${visibleNodes.length}`} />
        </div>
      </section>

      <div className="destiny-hall-workspace">
        <section className="destiny-path-board">
          <SectionHeading eyebrow="Destiny map" title="Constellation of Paths" value={`${destiny.availablePoints} points ready`} />
          <div className="destiny-category-legend" aria-label="Destiny node categories">
            {(Object.keys(categoryLabels) as DestinyNodeCategory[]).map((category) => (
              <span className={`is-${category}`} key={category}><i />{categoryLabels[category]}</span>
            ))}
          </div>

          <div className="destiny-constellation" role="list">
            <svg aria-hidden="true" className="destiny-constellation-links" viewBox="0 0 100 100" preserveAspectRatio="none">
              {visibleNodes.flatMap((node) => node.prerequisiteNodeIds.map((prerequisiteId) => {
                const prerequisite = visibleNodes.find((candidate) => candidate.id === prerequisiteId);
                if (!prerequisite) return null;
                const start = getHallPosition(prerequisite);
                const end = getHallPosition(node);
                const active = destiny.unlockedNodeIds.includes(prerequisite.id) && destiny.unlockedNodeIds.includes(node.id);
                return <line className={active ? "is-unlocked" : ""} key={`${prerequisite.id}-${node.id}`} x1={start.x} x2={end.x} y1={start.y} y2={end.y} />;
              }).filter(Boolean))}
            </svg>

            {visibleNodes.map((node) => {
              const status = getNodeStatus(character, node);
              const position = getHallPosition(node);
              return (
                <button
                  aria-label={`${node.name}, ${status}`}
                  className={`destiny-constellation-node is-${node.category} is-${node.shape} is-${status} ${selectedNode?.id === node.id ? "is-selected" : ""}`.trim()}
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  role="listitem"
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  type="button"
                >
                  <span className="destiny-node-sigil">{getNodeSigil(node)}</span>
                  <span className="destiny-node-copy"><strong>{node.name}</strong><small>{formatNodeMeta(node, status)}</small></span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="destiny-node-dossier">
          <SectionHeading eyebrow="Selected path" title="Node Dossier" value={selectedNode ? categoryLabels[selectedNode.category] : "No selection"} />
          {selectedNode ? (
            <>
              <div className={`destiny-dossier-identity is-${selectedNode.category}`}>
                <span>{getNodeSigil(selectedNode)}</span>
                <div><small>{selectedNode.shape} node</small><h3>{selectedNode.name}</h3><p>{selectedNode.description}</p></div>
              </div>
              <div className="destiny-dossier-stats">
                <DossierStat label="Status" value={destiny.unlockedNodeIds.includes(selectedNode.id) ? "Unlocked" : selectedStatus.reason} />
                <DossierStat label="Point cost" value={`${selectedNode.cost}`} />
                <DossierStat label="Required level" value={`${selectedNode.requiredLevel}`} />
                <DossierStat label="Discipline" value={selectedNode.allowedVocations?.join(", ") ?? "All vocations"} />
              </div>
              <div className="destiny-dossier-bonus">
                <span>Passive effect</span>
                <strong>{formatDestinyBonusSummary(selectedNode.bonus)}</strong>
              </div>
              <div className="destiny-dossier-prerequisites">
                <span>Prerequisites</span>
                <strong>{selectedNode.prerequisiteNodeIds.map((id) => getDestinyNodeById(id)?.name ?? id).join(", ") || "Path origin"}</strong>
              </div>
              <button className="destiny-unlock-command" disabled={!selectedStatus.canUnlock} onClick={() => onUnlock(selectedNode.id)} type="button">
                {destiny.unlockedNodeIds.includes(selectedNode.id) ? "Node unlocked" : `Unlock for ${selectedNode.cost} point${selectedNode.cost === 1 ? "" : "s"}`}
              </button>
            </>
          ) : <div className="destiny-empty-state">No Destiny nodes are available for this character.</div>}
          <button className="destiny-reset-command" disabled={resetCost <= 0} onClick={onReset} type="button">
            Reset path / {resetCost.toLocaleString("en-US")}g
          </button>
        </aside>
      </div>

      <section className="destiny-bonus-ledger">
        <SectionHeading eyebrow="Applied passives" title="Destiny Bonus Ledger" value={`${destiny.unlockedNodeIds.length} active nodes`} />
        <div className="destiny-bonus-grid">
          {getBonusEntries(activeBonuses).length > 0 ? getBonusEntries(activeBonuses).map((entry) => (
            <div className={`is-${entry.tone}`} key={entry.label}><span>{entry.sigil}</span><div><small>{entry.label}</small><strong>{entry.value}</strong></div></div>
          )) : <div className="destiny-empty-state"><strong>No passive bonuses active</strong><span>Unlock the origin node after level 10 to begin this path.</span></div>}
        </div>
      </section>
    </div>
  );
}

function findInitialNode(character: Character, nodes: DestinyNode[]) {
  const destiny = normalizeDestinyState(character);
  return nodes.find((node) => canUnlockDestinyNode({ ...character, destiny }, node.id).canUnlock)
    ?? [...nodes].reverse().find((node) => destiny.unlockedNodeIds.includes(node.id))
    ?? nodes[0]
    ?? destinyNodes[0];
}

function getNodeStatus(character: Character, node: DestinyNode) {
  const destiny = normalizeDestinyState(character);
  if (destiny.unlockedNodeIds.includes(node.id)) return "unlocked";
  return canUnlockDestinyNode({ ...character, destiny }, node.id).canUnlock ? "available" : "locked";
}

function getHallPosition(node: DestinyNode) {
  const fixed = hallPositions[node.id];
  if (fixed) return fixed;
  if (node.allowedVocations) {
    const vocationNodes = destinyNodes.filter((candidate) => candidate.allowedVocations?.[0] === node.allowedVocations?.[0]);
    const index = vocationNodes.findIndex((candidate) => candidate.id === node.id);
    return [{ x: 68, y: 22 }, { x: 84, y: 36 }, { x: 84, y: 9 }][Math.max(0, index)] ?? node.position;
  }
  return node.position;
}

function getNodeSigil(node: DestinyNode) {
  if (node.category === "core") return "CO";
  if (node.category === "offense") return "AT";
  if (node.category === "defense") return "DF";
  if (node.category === "utility") return "UT";
  return "VC";
}

function getVocationSigil(vocation: Character["vocation"]) {
  if (vocation === "Guardian") return "SH";
  if (vocation === "Ranger") return "BW";
  if (vocation === "Arcanist") return "AR";
  if (vocation === "Warden") return "WD";
  return "MK";
}

function formatNodeMeta(node: DestinyNode, status: string) {
  if (status === "unlocked") return "Active passive";
  if (status === "available") return `${node.cost} point${node.cost === 1 ? "" : "s"} / ready`;
  return `Level ${node.requiredLevel}`;
}

function getBonusEntries(bonus: DestinyBonus) {
  const entries = [
    bonus.maxHealthPercent ? { label: "Maximum health", value: `+${bonus.maxHealthPercent}%`, sigil: "HP", tone: "defense" } : undefined,
    bonus.attackPowerPercent ? { label: "Attack power", value: `+${bonus.attackPowerPercent}%`, sigil: "AT", tone: "offense" } : undefined,
    bonus.magicPowerPercent ? { label: "Magic power", value: `+${bonus.magicPowerPercent}%`, sigil: "MG", tone: "offense" } : undefined,
    bonus.distancePowerPercent ? { label: "Distance power", value: `+${bonus.distancePowerPercent}%`, sigil: "DS", tone: "offense" } : undefined,
    bonus.fistPowerPercent ? { label: "Fist power", value: `+${bonus.fistPowerPercent}%`, sigil: "FS", tone: "offense" } : undefined,
    bonus.defensePowerPercent ? { label: "Defense power", value: `+${bonus.defensePowerPercent}%`, sigil: "DF", tone: "defense" } : undefined,
    bonus.xpBonusPercent ? { label: "Hunt experience", value: `+${bonus.xpBonusPercent}%`, sigil: "XP", tone: "utility" } : undefined,
    bonus.goldBonusPercent ? { label: "Hunt gold", value: `+${bonus.goldBonusPercent}%`, sigil: "GO", tone: "utility" } : undefined,
    bonus.lootBonusPercent ? { label: "Loot value", value: `+${bonus.lootBonusPercent}%`, sigil: "LO", tone: "utility" } : undefined,
    bonus.supplyReductionPercent ? { label: "Supply use", value: `-${bonus.supplyReductionPercent}%`, sigil: "SP", tone: "utility" } : undefined,
    bonus.capacityBonusFlat ? { label: "Capacity", value: `+${bonus.capacityBonusFlat}`, sigil: "CP", tone: "core" } : undefined,
    bonus.deathRiskReductionPercent ? { label: "Death risk", value: `-${bonus.deathRiskReductionPercent}%`, sigil: "RS", tone: "defense" } : undefined,
    bonus.critChancePercent ? { label: "Critical chance", value: `+${bonus.critChancePercent}%`, sigil: "CR", tone: "vocation" } : undefined,
    bonus.critDamagePercent ? { label: "Critical damage", value: `+${bonus.critDamagePercent}%`, sigil: "CD", tone: "vocation" } : undefined,
  ];
  return entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function SectionHeading({ eyebrow, title, value }: { eyebrow: string; title: string; value: string }) {
  return <header className="destiny-section-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div><strong>{value}</strong></header>;
}

function DossierStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
