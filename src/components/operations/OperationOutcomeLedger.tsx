import { useEffect, useMemo, useState } from "react";
import {
  buildOperationOutcomeLedger,
  type OperationOutcomeKind,
  type OperationOutcomeLedgerEntry,
} from "../../game-engine/operations/buildOperationOutcomeLedger";
import type { Character, Guild } from "../../shared/types";

interface OperationOutcomeLedgerProps {
  guild: Guild;
  characters: Character[];
}

type OutcomeFilter = "all" | OperationOutcomeKind;
const OUTCOME_FILTERS: OutcomeFilter[] = ["all", "boss", "contract"];

export function OperationOutcomeLedger({ guild, characters }: OperationOutcomeLedgerProps) {
  const ledger = useMemo(() => buildOperationOutcomeLedger(guild, characters), [characters, guild]);
  const [filter, setFilter] = useState<OutcomeFilter>("all");
  const filteredEntries = useMemo(
    () => filter === "all" ? ledger.entries : ledger.entries.filter((entry) => entry.kind === filter),
    [filter, ledger.entries],
  );
  const [selectedId, setSelectedId] = useState<string | null>(ledger.entries[0]?.id ?? null);
  const selected = filteredEntries.find((entry) => entry.id === selectedId) ?? filteredEntries[0];

  useEffect(() => {
    if (selected?.id !== selectedId) setSelectedId(selected?.id ?? null);
  }, [selected?.id, selectedId]);

  return (
    <section className="operation-outcome-ledger">
      <header>
        <div>
          <span>After-action archive</span>
          <h4>Operation Outcome Ledger</h4>
        </div>
        <div className="operation-outcome-summary">
          <Metric label="Recorded" value={String(ledger.summary.recorded)} />
          <Metric label="Successful" value={`${ledger.summary.successes}/${ledger.summary.recorded}`} />
          <Metric label="Gross gold" value={`${formatNumber(ledger.summary.goldGained)}g`} />
          <Metric label="Costs" value={`${formatNumber(ledger.summary.costs)}g`} />
          <Metric label="Net result" value={formatSignedGold(ledger.summary.netGold)} tone={ledger.summary.netGold >= 0 ? "positive" : "negative"} />
          <Metric label="Renown / loot" value={`${formatNumber(ledger.summary.renownGained)} / ${formatNumber(ledger.summary.lootItems)}`} />
        </div>
      </header>

      <div className="operation-outcome-toolbar" role="tablist" aria-label="Operation outcome filters">
        <FilterButton active={filter === "all"} count={ledger.entries.length} filter="all" label="All reports" onSelect={selectFilter} />
        <FilterButton active={filter === "boss"} count={ledger.summary.bosses} filter="boss" label="Bosses" onSelect={selectFilter} />
        <FilterButton active={filter === "contract"} count={ledger.summary.contracts} filter="contract" label="Contracts" onSelect={selectFilter} />
      </div>

      <div
        aria-labelledby={`operation-outcome-tab-${filter}`}
        id="operation-outcome-panel"
        role="tabpanel"
      >
        {filteredEntries.length > 0 && selected ? (
          <div className="operation-outcome-body">
            <div className="operation-outcome-list" aria-label="Recorded operations">
              {filteredEntries.map((entry) => (
                <button
                  aria-pressed={entry.id === selected.id}
                  className={`is-${entry.kind} ${entry.success ? "is-success" : "is-failure"}`}
                  key={entry.id}
                  onClick={() => setSelectedId(entry.id)}
                  type="button"
                >
                  <i aria-hidden="true">{entry.kind === "boss" ? "B" : "C"}</i>
                  <span>
                    <small>{entry.kind} / {entry.region}</small>
                    <strong>{entry.targetName}</strong>
                    <em>{entry.participantNames.join(" / ")}</em>
                  </span>
                  <b>{entry.success ? "Success" : "Failed"}</b>
                  <time>{formatDate(entry.completedAt)}</time>
                </button>
              ))}
            </div>
            <OutcomeDossier entry={selected} />
          </div>
        ) : (
          <div className="operation-outcome-empty">
            <i aria-hidden="true">R</i>
            <div>
              <strong>No operation reports recorded</strong>
              <span>Completed bosses and guild contracts will be archived here.</span>
            </div>
          </div>
        )}
      </div>
      <small className="operation-outcome-note">
        The archive keeps the latest 20 boss reports and combines them with recent contract history stored in the local save.
      </small>
    </section>
  );

  function selectFilter(nextFilter: OutcomeFilter, focus = false) {
    setFilter(nextFilter);
    if (focus) document.getElementById(`operation-outcome-tab-${nextFilter}`)?.focus();
  }
}

function OutcomeDossier({ entry }: { entry: OperationOutcomeLedgerEntry }) {
  return (
    <article className={`operation-outcome-dossier is-${entry.kind}`}>
      <header>
        <i aria-hidden="true">{entry.kind === "boss" ? "B" : "C"}</i>
        <div>
          <span>{entry.kind} report / {entry.region}</span>
          <h5>{entry.targetName}</h5>
          <small>{formatDateTime(entry.completedAt)}</small>
        </div>
        <b className={entry.success ? "is-success" : "is-failure"}>{entry.success ? "Operation successful" : "Operation failed"}</b>
      </header>
      <div className="operation-outcome-economy">
        <Metric label="Gross reward" value={`${formatNumber(entry.goldGained)}g`} />
        <Metric label={entry.kind === "boss" ? "Entry fee" : "Dispatch cost"} value={`${formatNumber(entry.entryCost)}g`} />
        <Metric label="Loss penalty" value={`${formatNumber(entry.penaltyCost)}g`} />
        <Metric label="Net result" value={formatSignedGold(entry.netGold)} tone={entry.netGold >= 0 ? "positive" : "negative"} />
        <Metric label="Renown" value={`+${formatNumber(entry.renownGained)}`} />
        <Metric label="Experience" value={`+${formatNumber(entry.experienceGained)}`} />
      </div>
      <div className="operation-outcome-detail-grid">
        <section>
          <span>Deployed adventurers</span>
          <div className="operation-outcome-party">
            {entry.participantNames.map((name, index) => <b key={`${entry.participantIds[index]}-${index}`}>{name}</b>)}
          </div>
        </section>
        <section>
          <span>Recovered loot</span>
          {entry.loot.length > 0 ? (
            <div className="operation-outcome-loot">
              {entry.loot.map((loot) => (
                <b key={loot.itemId}><i aria-hidden="true">I</i>{loot.name}<em>x{formatNumber(loot.quantity)}</em></b>
              ))}
            </div>
          ) : <p>No item loot recorded.</p>}
        </section>
      </div>
    </article>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return <div className={tone ? `is-${tone}` : undefined}><span>{label}</span><strong>{value}</strong></div>;
}

function FilterButton({
  active,
  count,
  filter,
  label,
  onSelect,
}: {
  active: boolean;
  count: number;
  filter: OutcomeFilter;
  label: string;
  onSelect: (filter: OutcomeFilter, focus?: boolean) => void;
}) {
  return (
    <button
      aria-controls={active ? "operation-outcome-panel" : undefined}
      aria-selected={active}
      id={`operation-outcome-tab-${filter}`}
      onClick={() => onSelect(filter)}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const currentIndex = OUTCOME_FILTERS.indexOf(filter);
        const nextIndex = event.key === "Home"
          ? 0
          : event.key === "End"
            ? OUTCOME_FILTERS.length - 1
            : (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + OUTCOME_FILTERS.length)
              % OUTCOME_FILTERS.length;
        onSelect(OUTCOME_FILTERS[nextIndex], true);
      }}
      role="tab"
      tabIndex={active ? 0 : -1}
      type="button"
    >
      <span>{label}</span><b>{count}</b>
    </button>
  );
}

function formatNumber(value: number) {
  return Math.max(0, Math.floor(value)).toLocaleString("en-US");
}

function formatSignedGold(value: number) {
  const amount = Math.floor(value);
  return `${amount >= 0 ? "+" : "-"}${Math.abs(amount).toLocaleString("en-US")}g`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
