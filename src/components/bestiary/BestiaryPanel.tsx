import { useMemo, useState } from "react";
import { getCharmById } from "../../data/charms";
import { normalizeBestiaryState } from "../../game-engine/bestiary/getBestiaryProgress";
import type { BestiaryStage, Character, Guild } from "../../shared/types";
import { BestiaryDetails } from "./BestiaryDetails";
import { BestiaryMonsterCard } from "./BestiaryMonsterCard";
import { CharmPanel } from "./CharmPanel";

interface BestiaryPanelProps {
  character: Character;
  guild: Guild;
  onAssignCharm: (charmId: string, monsterId: string) => void;
  onClaimReward: (monsterId: string) => void;
  onOpenFocus: () => void;
  onRemoveCharm: (monsterId: string) => void;
  onUnlockCharm: (charmId: string) => void;
}

export function BestiaryPanel({
  character,
  guild,
  onAssignCharm,
  onClaimReward,
  onOpenFocus,
  onRemoveCharm,
  onUnlockCharm,
}: BestiaryPanelProps) {
  const bestiary = normalizeBestiaryState(guild.bestiary);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | undefined>(bestiary.progress[0]?.monsterId);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<BestiaryStage | "all">("all");
  const sortedProgress = useMemo(
    () => [...bestiary.progress].sort((a, b) => a.monsterName.localeCompare(b.monsterName)),
    [bestiary.progress],
  );
  const selectedProgress = sortedProgress.find((progress) => progress.monsterId === selectedMonsterId) ?? sortedProgress[0];
  const completedCount = bestiary.progress.filter((progress) => progress.stage === "completed").length;
  const claimableCount = bestiary.progress.filter(
    (progress) => progress.stage === "completed" && !progress.charmPointsClaimed,
  ).length;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProgress = sortedProgress.filter((progress) =>
    (stageFilter === "all" || progress.stage === stageFilter) &&
    progress.monsterName.toLowerCase().includes(normalizedQuery),
  );

  return (
    <div className="hunting-research-hall bestiary-panel">
      <section className="research-hall-hero">
        <div className="research-hall-seal"><span>B</span><i /></div>
        <div className="research-hall-identity">
          <span>Guild hunting research</span>
          <h3>{guild.name} Bestiary</h3>
          <p>Field records, creature dossiers and charm assignments</p>
        </div>
        <div className="research-hall-summary">
          <SummaryStat label="Seen" value={bestiary.progress.length.toLocaleString("en-US")} />
          <SummaryStat label="Completed" value={completedCount.toLocaleString("en-US")} />
          <SummaryStat label="Charm points" value={bestiary.charmPoints.toLocaleString("en-US")} />
        </div>
      </section>

      <nav className="research-hall-tabs" aria-label="Hunting research sections">
        <button className="is-active" type="button">Bestiary Registry</button>
        <button onClick={onOpenFocus} type="button">Monster Focus for {character.name}</button>
      </nav>

      <div className="bestiary-layout">
        <section className="bestiary-registry">
          <ResearchHeading eyebrow="Creature records" title="Registry" value={`${filteredProgress.length}/${sortedProgress.length}`} />
          <input
            aria-label="Search bestiary"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search creature"
            type="search"
            value={query}
          />
          <div className="bestiary-stage-filters">
            {(["all", "started", "revealed", "completed"] as const).map((stage) => (
              <button
                className={stageFilter === stage ? "is-selected" : ""}
                key={stage}
                onClick={() => setStageFilter(stage)}
                type="button"
              >
                {stage}
              </button>
            ))}
          </div>
          <div className="bestiary-list">
            {filteredProgress.length > 0 ? filteredProgress.map((progress) => {
              const activeCharm = bestiary.activeCharms.find((assignment) => assignment.monsterId === progress.monsterId);
              return (
                <BestiaryMonsterCard
                  activeCharm={activeCharm}
                  charmName={getCharmById(activeCharm?.charmId)?.name}
                  isSelected={selectedProgress?.monsterId === progress.monsterId}
                  key={progress.monsterId}
                  onClaimReward={() => onClaimReward(progress.monsterId)}
                  onSelect={() => setSelectedMonsterId(progress.monsterId)}
                  progress={progress}
                />
              );
            }) : (
              <div className="research-empty-state"><strong>No matching records</strong><span>Complete hunts to expand the registry.</span></div>
            )}
          </div>
        </section>

        <section className="bestiary-dossier">
          <ResearchHeading eyebrow="Selected record" title="Creature Dossier" value={selectedProgress?.stage ?? "Empty"} />
          <BestiaryDetails progress={selectedProgress} />
          {claimableCount > 0 ? <div className="bestiary-claim-notice">{claimableCount} reward ready to claim</div> : null}
        </section>

        <section className="bestiary-charms">
          <ResearchHeading eyebrow="Guild charms" title="Charm Cabinet" value={`${bestiary.unlockedCharmIds.length} unlocked`} />
          <CharmPanel
            bestiary={bestiary}
            onAssignCharm={onAssignCharm}
            onRemoveCharm={onRemoveCharm}
            onUnlockCharm={onUnlockCharm}
            selectedProgress={selectedProgress}
          />
        </section>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function ResearchHeading({ eyebrow, title, value }: { eyebrow: string; title: string; value: string }) {
  return <header className="research-section-heading"><div><span>{eyebrow}</span><h3>{title}</h3></div><strong>{value}</strong></header>;
}
