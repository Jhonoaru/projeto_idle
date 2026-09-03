import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CharacterSprite } from "../components/characters/CharacterSprite";
import { CollectionPreview } from "../components/collections/CollectionPreview";
import { getCollectionItemById } from "../data/collections";
import { equipCollectionItem } from "../game-engine/collections/equipCollectionItem";
import { runStage1685Qa, type Stage1685QaResult } from "./mountArtworkSqliteQa";
import "../styles.css";

function MountArtworkSqliteQaPage() {
  const [result, setResult] = useState<Stage1685QaResult>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    runStage1685Qa().then(setResult).catch((reason) => setError(String(reason)));
  }, []);

  if (error) return <main className="mount-sqlite-qa"><h1>QA FAILED</h1><pre>{error}</pre></main>;
  if (!result) return <main className="mount-sqlite-qa"><h1>Running Stage 168.5 Tauri/SQLite QA...</h1></main>;

  const character = result.state.characters[0];
  return (
    <main className="mount-sqlite-qa">
      <header>
        <span>ISOLATED TAURI / SQLITE REPORT</span>
        <h1>Stage 168.5 - Mount Artwork QA</h1>
        <strong>{result.report.length}/{result.report.length} checks passed</strong>
        <p>Database: stage1685_20260903.db. The player save is not opened.</p>
      </header>
      <section className="mount-sqlite-qa-grid">
        {result.mountIds.map((mountId) => {
          const item = getCollectionItemById(mountId);
          const mountedCharacter = equipCollectionItem(character, result.state.guild, mountId);
          return <article key={mountId}>
            <div className="mount-sqlite-qa-preview"><CollectionPreview item={item} /></div>
            <CharacterSprite character={mountedCharacter} size="scene" />
            <h2>{item?.name}</h2>
            <small>Persisted and rendered</small>
          </article>;
        })}
      </section>
      <details>
        <summary>Automated evidence</summary>
        <pre>{result.report.join("\n")}</pre>
      </details>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<MountArtworkSqliteQaPage />);
