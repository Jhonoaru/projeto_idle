import { useEffect, useRef, useState } from "react";
import { starterChoices } from "../../game-engine/new-game/createNewGame";
import { startMenuMusic } from "./menuMusic";
import "./main-menu.css";

export function MainMenu({ hasSave, guildName, loading, unavailable, onContinue, onNewGame }: {
  hasSave: boolean; guildName: string; loading: boolean; unavailable: boolean;
  onContinue: () => void; onNewGame: (guild: string, hero: string, candidate: string) => Promise<void>;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [hero, setHero] = useState("");
  const [candidate, setCandidate] = useState(starterChoices[0].id);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(0.35);
  const [musicOn, setMusicOn] = useState(false);
  const music = useRef<ReturnType<typeof startMenuMusic> | null>(null);
  useEffect(() => () => music.current?.stop(), []);
  function toggleMusic() {
    if (music.current) { music.current.stop(); music.current = null; setMusicOn(false); }
    else { try { music.current = startMenuMusic(volume); setMusicOn(true); } catch { setError("Audio indisponivel neste dispositivo."); } }
  }
  return <main className="title-screen">
    <div className="title-screen-art" aria-hidden="true" />
    <div className="title-screen-content">
      <span className="title-screen-kicker">UMA GUILDA. INUMERAS JORNADAS.</span>
      <h1>Guild Hunt <span>Idle</span></h1>
      {!creating ? <nav aria-label="Menu principal" className="title-screen-nav">
        <button disabled={!hasSave || loading || unavailable} onClick={onContinue}>Continuar {hasSave && <small>{guildName}</small>}</button>
        <button disabled={loading || unavailable} onClick={() => setCreating(true)}>Novo jogo</button>
        {loading && <p role="status">Verificando save local...</p>}
        {unavailable && <p role="alert">Save local indisponivel. Abra o jogo pelo Tauri para continuar ou criar sua guilda com seguranca.</p>}
      </nav> : <form className="new-game-form" onSubmit={async event => {
        event.preventDefault(); if (busy || (hasSave && confirmation !== guildName)) return;
        setBusy(true); setError("");
        try { await onNewGame(name, hero, candidate); } catch (reason) { setError(reason instanceof Error ? reason.message : "Falha ao criar a guilda."); } finally { setBusy(false); }
      }}>
        <h2>Funde sua guilda</h2>
        <label>Nome da guilda<input required minLength={2} maxLength={32} value={name} onChange={event => setName(event.target.value)} /></label>
        <label>Primeiro aventureiro<input required minLength={2} maxLength={24} value={hero} onChange={event => setHero(event.target.value)} /></label>
        <fieldset><legend>Vocacao inicial</legend><div className="starter-choices">{starterChoices.map(choice => <label key={choice.id}>
          <input type="radio" name="vocation" value={choice.id} checked={candidate === choice.id} onChange={() => setCandidate(choice.id)} />{choice.vocation}
        </label>)}</div></fieldset>
        <p>Nivel 1 · 150 gold · 1 aventureiro · Thaeron</p>
        {hasSave && <label className="new-game-warning">O save atual sera substituido. Digite "{guildName}" para confirmar.<input value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" /></label>}
        <div className="new-game-actions"><button type="button" disabled={busy} onClick={() => setCreating(false)}>Voltar</button><button disabled={busy || (hasSave && confirmation !== guildName)}>{busy ? "Fundando..." : "Fundar guilda"}</button></div>
      </form>}
      {error && <p role="alert">{error}</p>}
    </div>
    <footer className="title-screen-footer"><span>RPG de guilda · Offline · Um jogador</span><div><button onClick={toggleMusic} aria-pressed={musicOn}>{musicOn ? "Pausar musica" : "Ativar musica"}</button><input aria-label="Volume da musica" type="range" min="0" max="1" step="0.05" value={volume} onChange={event => { const value = Number(event.target.value); setVolume(value); music.current?.volume(value); }} /></div></footer>
  </main>;
}
