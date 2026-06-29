import { useEffect, useState } from "react";
import { formatDuration } from "../../shared/time";
import type { Boss, Character } from "../../shared/types";

interface BossCooldownListProps {
  character: Character;
  bosses: Boss[];
  onClearCooldown: (characterId: string, bossId: string) => void;
}

export function BossCooldownList({
  character,
  bosses,
  onClearCooldown,
}: BossCooldownListProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((tick) => tick + 1), 1000);

    return () => window.clearInterval(interval);
  }, []);

  if (character.bossCooldowns.length === 0) {
    return <div className="empty-list">No boss cooldowns.</div>;
  }

  return (
    <div className="boss-cooldown-list">
      {character.bossCooldowns.map((cooldown) => {
        const boss = bosses.find((candidate) => candidate.id === cooldown.bossId);
        const remainingMs = new Date(cooldown.availableAt).getTime() - Date.now();
        const isReady = remainingMs <= 0;

        return (
          <article className="boss-cooldown-row" key={`${cooldown.characterId}-${cooldown.bossId}`}>
            <div>
              <strong>{boss?.name ?? cooldown.bossId}</strong>
              <span>{isReady ? "Disponivel agora" : formatDuration(remainingMs)}</span>
            </div>
            {/* Temporary local testing helper until persistence/dev tools exist. */}
            <button
              onClick={() => onClearCooldown(character.id, cooldown.bossId)}
              type="button"
            >
              Debug: limpar cooldown
            </button>
          </article>
        );
      })}
    </div>
  );
}
