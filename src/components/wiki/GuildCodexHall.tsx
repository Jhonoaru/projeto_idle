import { useEffect, useMemo, useState } from "react";
import {
  guildCodexEntries,
  type GuildCodexCategory,
  type GuildCodexEntry,
} from "../../data/guildCodex";

type CodexFilter = "all" | GuildCodexCategory;

const filters: Array<{ id: CodexFilter; label: string; code: string }> = [
  { id: "all", label: "All Records", code: "ALL" },
  { id: "adventurers", label: "Adventurers", code: "ADV" },
  { id: "exploration", label: "Exploration", code: "EXP" },
  { id: "progression", label: "Progression", code: "PRO" },
  { id: "services", label: "Guild Services", code: "SRV" },
];

export function GuildCodexHall() {
  const [filter, setFilter] = useState<CodexFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(guildCodexEntries.find((entry) => entry.featured)?.id ?? guildCodexEntries[0]?.id ?? "");
  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return guildCodexEntries.filter((entry) => {
      const matchesFilter = filter === "all" || entry.category === filter;
      const searchable = [
        entry.title,
        entry.subtitle,
        entry.summary,
        ...entry.guidance,
        ...entry.relatedSystems,
        ...entry.facts.flatMap((fact) => [fact.label, fact.value]),
        ...(entry.keywords ?? []),
      ].join(" ").toLowerCase();
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [filter, query]);
  const selectedEntry = guildCodexEntries.find((entry) => entry.id === selectedId) ?? visibleEntries[0];
  const vocationCount = getFilterCount("adventurers");
  const explorationCount = getFilterCount("exploration");
  const guideCount = getFilterCount("progression") + getFilterCount("services");

  useEffect(() => {
    if (visibleEntries.length > 0 && !visibleEntries.some((entry) => entry.id === selectedId)) {
      setSelectedId(visibleEntries[0].id);
    }
  }, [selectedId, visibleEntries]);

  return (
    <div className="codex-hall">
      <section className="codex-hall-hero">
        <div className="codex-hall-seal" aria-hidden="true"><i /><span>W</span></div>
        <div className="codex-hall-identity">
          <span>Thaeron guild archive</span>
          <h3>Guild Hunt Field Codex</h3>
          <p>Local reference for adventurers, exploration routes, progression and guild services.</p>
        </div>
        <div className="codex-hall-summary">
          <SummaryStat label="Archive records" value={`${guildCodexEntries.length}`} />
          <SummaryStat label="Vocations" value={`${vocationCount}`} />
          <SummaryStat label="Field records" value={`${explorationCount}`} />
          <SummaryStat label="System guides" value={`${guideCount}`} />
        </div>
      </section>

      <div className="codex-local-banner">
        <span>Offline reference</span>
        <strong>Every entry is bundled with the client and reflects the installed local game data.</strong>
        <em>Read-only archive</em>
      </div>

      <nav className="codex-category-tabs" aria-label="Codex category">
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

      <div className="codex-hall-workspace">
        <section className="codex-index-board">
          <header className="codex-section-heading">
            <div><span>Archive index</span><h3>Knowledge Records</h3></div>
            <strong>{visibleEntries.length}/{guildCodexEntries.length} visible</strong>
          </header>

          <label className="codex-search-field">
            <span>Search codex</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vocation, hunt, system or keyword..."
              type="search"
              value={query}
            />
          </label>

          <div className="codex-entry-list">
            {visibleEntries.map((entry) => (
              <button
                className={`codex-entry-card is-${entry.category} ${selectedEntry?.id === entry.id ? "is-selected" : ""}`}
                key={entry.id}
                onClick={() => setSelectedId(entry.id)}
                type="button"
              >
                <i>{entry.code}</i>
                <span>
                  <small>{formatCategory(entry.category)} / {entry.subtitle}</small>
                  <strong>{entry.title}</strong>
                  <p>{entry.summary}</p>
                </span>
                <em>{entry.featured ? "Start here" : formatCategory(entry.category)}</em>
              </button>
            ))}
            {visibleEntries.length === 0 ? <div className="codex-empty">No codex record matches this search.</div> : null}
          </div>
        </section>

        <aside className="codex-entry-dossier">
          <header className="codex-section-heading">
            <div><span>Selected record</span><h3>{selectedEntry?.title ?? "No record"}</h3></div>
            <strong>{selectedEntry ? formatCategory(selectedEntry.category) : "-"}</strong>
          </header>

          {selectedEntry ? <CodexDossier entry={selectedEntry} /> : null}
        </aside>
      </div>

      <section className="codex-route-ledger">
        <header className="codex-section-heading">
          <div><span>Guild field route</span><h3>Recommended Reading Path</h3></div>
          <strong>From first contract to mastery</strong>
        </header>
        <div>
          <RouteEntry code="I" title="Command" text="Select an adventurer and inspect the guild roster." />
          <RouteEntry code="II" title="Explore" text="Complete contracts, hunts and access quests." />
          <RouteEntry code="III" title="Research" text="Advance Bestiary, Charms and target studies." />
          <RouteEntry code="IV" title="Advance" text="Train skills, forge equipment and shape Destiny." />
        </div>
      </section>
    </div>
  );
}

function CodexDossier({ entry }: { entry: GuildCodexEntry }) {
  return (
    <>
      <div className={`codex-dossier-identity is-${entry.category}`}>
        <span>{entry.code}</span>
        <div>
          <small>{entry.subtitle} / Local record</small>
          <h3>{entry.title}</h3>
          <p>{entry.summary}</p>
        </div>
      </div>

      <section className="codex-fact-grid">
        {entry.facts.map((fact) => <div key={fact.label}><span>{fact.label}</span><strong>{fact.value}</strong></div>)}
      </section>

      <section className="codex-guidance">
        <span>Field guidance</span>
        {entry.guidance.map((guidance, index) => (
          <article key={guidance}><i>{index + 1}</i><p>{guidance}</p></article>
        ))}
      </section>

      <section className="codex-related-systems">
        <span>Related systems</span>
        <div>{entry.relatedSystems.map((system) => <strong key={system}>{system}</strong>)}</div>
      </section>

      <div className="codex-record-status">
        <span>Record state</span>
        <strong>Available locally</strong>
        <small>This guide does not modify the save or require an online account.</small>
      </div>
    </>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function RouteEntry({ code, title, text }: { code: string; title: string; text: string }) {
  return <article><span>{code}</span><div><strong>{title}</strong><p>{text}</p></div></article>;
}

function getFilterCount(filter: CodexFilter) {
  return filter === "all" ? guildCodexEntries.length : guildCodexEntries.filter((entry) => entry.category === filter).length;
}

function formatCategory(category: GuildCodexCategory) {
  if (category === "adventurers") return "Adventurers";
  if (category === "exploration") return "Exploration";
  if (category === "progression") return "Progression";
  return "Guild Services";
}
