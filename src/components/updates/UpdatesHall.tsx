import { useEffect, useMemo, useState } from "react";
import {
  clientUpdates,
  type ClientUpdateCategory,
  type ClientUpdateDefinition,
} from "../../data/clientUpdates";

type UpdateFilter = "all" | ClientUpdateCategory;

const filters: Array<{ id: UpdateFilter; label: string; code: string }> = [
  { id: "all", label: "All Releases", code: "ALL" },
  { id: "systems", label: "Systems", code: "SYS" },
  { id: "interface", label: "Interface", code: "UI" },
  { id: "qa", label: "QA Records", code: "QA" },
];

export function UpdatesHall() {
  const [filter, setFilter] = useState<UpdateFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(clientUpdates[0]?.id ?? "");
  const visibleUpdates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return clientUpdates.filter((update) => {
      const matchesFilter = filter === "all" || update.category === filter;
      const searchable = [update.stage, update.title, update.summary, ...update.highlights, ...update.systems]
        .join(" ")
        .toLowerCase();
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [filter, query]);
  const selectedUpdate = clientUpdates.find((update) => update.id === selectedId) ?? visibleUpdates[0];
  const systemCount = clientUpdates.filter((update) => update.category === "systems").length;
  const interfaceCount = clientUpdates.filter((update) => update.category === "interface").length;
  const qaCount = clientUpdates.filter((update) => update.category === "qa").length;

  useEffect(() => {
    if (visibleUpdates.length > 0 && !visibleUpdates.some((update) => update.id === selectedId)) {
      setSelectedId(visibleUpdates[0].id);
    }
  }, [selectedId, visibleUpdates]);

  return (
    <div className="updates-hall">
      <section className="updates-hall-hero">
        <div className="updates-hall-seal" aria-hidden="true"><i /><span>U</span></div>
        <div className="updates-hall-identity">
          <span>Local client chronicle</span>
          <h3>Guild Hunt Release Archive</h3>
          <p>Delivered systems, interface revisions and verified QA milestones.</p>
        </div>
        <div className="updates-hall-summary">
          <SummaryStat label="Release records" value={`${clientUpdates.length}`} />
          <SummaryStat label="Systems" value={`${systemCount}`} />
          <SummaryStat label="Interface" value={`${interfaceCount}`} />
          <SummaryStat label="QA records" value={`${qaCount}`} />
        </div>
      </section>

      <div className="updates-local-banner">
        <span>Installed chronicle</span>
        <strong>Release notes are bundled with this offline client. No download or account is required.</strong>
        <em>Current: {clientUpdates[0]?.stage}</em>
      </div>

      <nav className="updates-category-tabs" aria-label="Update category">
        {filters.map((entry) => (
          <button
            className={filter === entry.id ? "is-active" : ""}
            key={entry.id}
            onClick={() => setFilter(entry.id)}
            type="button"
          >
            <span>{entry.code}</span>
            <strong>{entry.label}</strong>
            <small>{getFilterCount(entry.id)} records</small>
          </button>
        ))}
      </nav>

      <div className="updates-hall-workspace">
        <section className="updates-release-board">
          <header className="updates-section-heading">
            <div><span>Release ledger</span><h3>Client Updates</h3></div>
            <strong>{visibleUpdates.length}/{clientUpdates.length} visible</strong>
          </header>

          <label className="updates-search-field">
            <span>Search archive</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search systems or release..."
              type="search"
              value={query}
            />
          </label>

          <div className="updates-release-list">
            {visibleUpdates.map((update) => (
              <button
                className={`updates-release-card is-${update.category} ${selectedUpdate?.id === update.id ? "is-selected" : ""}`}
                key={update.id}
                onClick={() => setSelectedId(update.id)}
                type="button"
              >
                <i>{getCategoryCode(update.category)}</i>
                <span>
                  <small>{update.stage} / {formatDate(update.date)}</small>
                  <strong>{update.title}</strong>
                  <p>{update.summary}</p>
                </span>
                <em>{update.featured ? "Current" : formatCategory(update.category)}</em>
              </button>
            ))}
            {visibleUpdates.length === 0 ? (
              <div className="updates-empty">No release record matches this archive search.</div>
            ) : null}
          </div>
        </section>

        <aside className="updates-release-dossier">
          <header className="updates-section-heading">
            <div><span>Selected record</span><h3>{selectedUpdate?.stage ?? "No release"}</h3></div>
            <strong>{selectedUpdate ? formatCategory(selectedUpdate.category) : "-"}</strong>
          </header>

          {selectedUpdate ? (
            <>
              <div className={`updates-dossier-identity is-${selectedUpdate.category}`}>
                <span>{getCategoryCode(selectedUpdate.category)}</span>
                <div>
                  <small>{formatDate(selectedUpdate.date)} / Installed</small>
                  <h3>{selectedUpdate.title}</h3>
                  <p>{selectedUpdate.summary}</p>
                </div>
              </div>

              <section className="updates-highlights">
                <span>Release highlights</span>
                {selectedUpdate.highlights.map((highlight, index) => (
                  <article key={highlight}><i>{index + 1}</i><p>{highlight}</p></article>
                ))}
              </section>

              <section className="updates-system-tags">
                <span>Included systems</span>
                <div>{selectedUpdate.systems.map((system) => <strong key={system}>{system}</strong>)}</div>
              </section>

              <div className="updates-record-status">
                <span>Archive state</span>
                <strong>Released locally</strong>
                <small>Bundled with the installed client and available throughout the local campaign.</small>
              </div>
            </>
          ) : null}
        </aside>
      </div>

      <section className="updates-era-ledger">
        <header className="updates-section-heading">
          <div><span>Development route</span><h3>Recent Client Eras</h3></div>
          <strong>Offline project history</strong>
        </header>
        <div>
          <EraEntry code="I" title="Foundation" range="Stages 1-20" text="Core guild management, persistence and first client layout." />
          <EraEntry code="II" title="Gameplay" range="Stages 21-29" text="Collections, rewards, market, combat and balance passes." />
          <EraEntry code="III" title="Client Rework" range="Stages 30-35" text="Explore, hunt scene, character, skills and training halls." />
          <EraEntry code="IV" title="Guild Halls" range="Stages 36-44" text="Blessings, research, destiny, collections, ledgers, archive and field codex." />
        </div>
      </section>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function EraEntry({ code, title, range, text }: { code: string; title: string; range: string; text: string }) {
  return <article><span>{code}</span><div><small>{range}</small><strong>{title}</strong><p>{text}</p></div></article>;
}

function getFilterCount(filter: UpdateFilter) {
  return filter === "all" ? clientUpdates.length : clientUpdates.filter((update) => update.category === filter).length;
}

function getCategoryCode(category: ClientUpdateCategory) {
  if (category === "systems") return "SYS";
  if (category === "interface") return "UI";
  return "QA";
}

function formatCategory(category: ClientUpdateCategory) {
  if (category === "systems") return "Systems";
  if (category === "interface") return "Interface";
  return "Quality Assurance";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}
