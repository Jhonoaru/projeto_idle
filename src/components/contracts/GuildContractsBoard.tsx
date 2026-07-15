import { useEffect, useMemo, useState } from "react";
import { guildContracts, getGuildContract } from "../../data/guildContracts";
import { items } from "../../data/items";
import { getGuildCareer } from "../../game-engine/achievements/getGuildCareer";
import { calculateExpeditionSuccessChance, calculateExpeditionTeamPower, getGuildContractAvailability } from "../../game-engine/expeditions/getGuildContractAvailability";
import { getGuildExpeditionRemainingMs } from "../../game-engine/expeditions/finishGuildExpedition";
import { normalizeGuildExpeditionState } from "../../game-engine/expeditions/normalizeGuildExpeditionState";
import { getHeadquartersRank } from "../../game-engine/headquarters/getHeadquartersBonuses";
import type { Character, Guild, GuildContractDefinition } from "../../shared/types";

interface GuildContractsBoardProps {
  guild: Guild;
  characters: Character[];
  onStartExpedition: (contractId: string, assignedCharacterIds: string[]) => void;
  onCompleteExpedition: () => void;
}

export function GuildContractsBoard({ guild, characters, onStartExpedition, onCompleteExpedition }: GuildContractsBoardProps) {
  const expeditions = useMemo(() => normalizeGuildExpeditionState(guild.expeditions), [guild.expeditions]);
  const career = useMemo(() => getGuildCareer(guild, characters), [characters, guild]);
  const headquarters = useMemo(() => getHeadquartersRank(guild.headquarters), [guild.headquarters]);
  const initialTeam = useMemo(
    () => [...characters].filter((character) => character.status !== "dead").sort((left, right) => right.level - left.level).slice(0, 2).map((character) => character.id),
    [characters],
  );
  const [selectedContractId, setSelectedContractId] = useState(guildContracts[0].id);
  const [assignedCharacterIds, setAssignedCharacterIds] = useState<string[]>(initialTeam);
  const [clock, setClock] = useState(() => Date.now());
  const selectedContract = getGuildContract(selectedContractId) ?? guildContracts[0];
  const availability = getGuildContractAvailability(selectedContract, guild, characters);
  const teamPower = calculateExpeditionTeamPower(characters, assignedCharacterIds);
  const successChance = calculateExpeditionSuccessChance(teamPower, selectedContract.recommendedPower);
  const active = expeditions.activeExpedition;
  const activeContract = active ? getGuildContract(active.contractId) : undefined;
  const remainingMs = active ? getGuildExpeditionRemainingMs(guild, new Date(clock)) : 0;
  const ready = Boolean(active && remainingMs <= 0);
  const durationMs = active ? Math.max(1, Date.parse(active.endsAt) - Date.parse(active.startedAt)) : 1;
  const progressPercent = active ? Math.min(100, Math.max(0, Math.round(((durationMs - remainingMs) / durationMs) * 100))) : 0;

  useEffect(() => {
    if (!active) return undefined;
    setClock(Date.now());
    const interval = window.setInterval(() => setClock(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [active]);

  useEffect(() => {
    setAssignedCharacterIds((current) => current.filter((characterId) => characters.some((character) => character.id === characterId && character.status !== "dead")));
  }, [characters]);

  function toggleCharacter(characterId: string) {
    setAssignedCharacterIds((current) => {
      if (current.includes(characterId)) return current.filter((entry) => entry !== characterId);
      if (current.length >= selectedContract.maximumTeamSize) return current;
      return [...current, characterId];
    });
  }

  function selectContract(contractId: string) {
    const contract = getGuildContract(contractId);
    if (!contract) return;
    setSelectedContractId(contractId);
    setAssignedCharacterIds((current) => current.slice(0, contract.maximumTeamSize));
  }

  const teamReady = assignedCharacterIds.length >= selectedContract.minimumTeamSize && assignedCharacterIds.length <= selectedContract.maximumTeamSize;
  const canDispatch = !active && availability.available && teamReady && guild.gold >= selectedContract.dispatchCost;

  return (
    <div className="contracts-board">
      <section className="contracts-hero">
        <div className="contracts-seal" aria-hidden="true"><i>C</i><span>{expeditions.totalSucceeded}/{expeditions.totalCompleted}</span></div>
        <div className="contracts-identity">
          <span>Guild operations desk</span>
          <h3>{guild.name} Contracts Board</h3>
          <p>Dispatch support teams on short local assignments without interrupting personal hunts, training or quests.</p>
        </div>
        <div className="contracts-summary">
          <Summary label="Board status" value={active ? "Expedition active" : "Ready to dispatch"} />
          <Summary label="Completed" value={String(expeditions.totalCompleted)} />
          <Summary label="Career points" value={String(career.points)} />
          <Summary label="Headquarters" value={`${headquarters.totalLevels}/12`} />
        </div>
      </section>

      {active && activeContract ? (
        <section className={`contracts-active ${ready ? "is-ready" : ""}`}>
          <div className="contracts-active-sigil"><i>{activeContract.sigil}</i><span>Active dispatch</span></div>
          <div className="contracts-active-copy">
            <span>{activeContract.region}</span>
            <h3>{activeContract.name}</h3>
            <p>{active.assignedCharacterIds.map((characterId) => characters.find((character) => character.id === characterId)?.name ?? "Unknown").join(" / ")}</p>
          </div>
          <div className="contracts-active-progress">
            <div><span>Progress</span><strong>{progressPercent}%</strong></div>
            <progress max={100} value={progressPercent} />
            <small>{ready ? "Report ready for collection" : `${formatCountdown(remainingMs)} remaining`}</small>
          </div>
          <div className="contracts-active-command">
            <span>Success chance</span><strong>{active.successChance}%</strong>
            <button disabled={!ready} onClick={onCompleteExpedition} type="button">{ready ? "Collect Report" : "Expedition Underway"}</button>
          </div>
        </section>
      ) : null}

      <div className="contracts-workspace">
        <section className="contracts-list-panel">
          <header className="ranking-section-heading">
            <div><span>Local operations</span><h3>Available Contracts</h3></div>
            <strong>{guildContracts.length} postings</strong>
          </header>
          <div className="contracts-list">
            {guildContracts.map((contract) => (
              <ContractCard
                contract={contract}
                guild={guild}
                characters={characters}
                key={contract.id}
                onSelect={() => selectContract(contract.id)}
                selected={contract.id === selectedContract.id}
              />
            ))}
          </div>
        </section>

        <aside className="contracts-dossier">
          <header className="ranking-section-heading">
            <div><span>Selected posting</span><h3>{selectedContract.name}</h3></div>
            <strong>{formatRisk(selectedContract.risk)}</strong>
          </header>
          <div className="contracts-dossier-lead">
            <i>{selectedContract.sigil}</i>
            <div><span>{selectedContract.region}</span><strong>{formatDuration(selectedContract.durationMinutes)}</strong><small>{selectedContract.description}</small></div>
          </div>
          <div className="contracts-order-grid">
            <Summary label="Dispatch cost" value={`${selectedContract.dispatchCost.toLocaleString("en-US")}g`} />
            <Summary label="Recommended" value={`${selectedContract.recommendedPower} power`} />
            <Summary label="Gold reward" value={`${selectedContract.rewardGold.toLocaleString("en-US")}g`} />
            <Summary label="Renown" value={`+${selectedContract.rewardRenown}`} />
          </div>
          <div className="contracts-material-reward">
            <span>Guild Depot reward</span>
            <strong>{formatItemReward(selectedContract)}</strong>
          </div>
          <section className="contracts-team">
            <header><span>Support team</span><strong>{assignedCharacterIds.length}/{selectedContract.maximumTeamSize}</strong></header>
            <div>
              {characters.map((character) => {
                const selected = assignedCharacterIds.includes(character.id);
                const disabled = character.status === "dead" || (!selected && assignedCharacterIds.length >= selectedContract.maximumTeamSize);
                return (
                  <label className={disabled ? "is-disabled" : ""} key={character.id}>
                    <input checked={selected} disabled={disabled} onChange={() => toggleCharacter(character.id)} type="checkbox" />
                    <i>{character.name.charAt(0)}</i>
                    <span><strong>{character.name}</strong><small>Lv {character.level} {character.vocation}</small></span>
                    <b>{Math.max(1, character.level) * 4 + character.attributes.attackPower + character.attributes.defensePower}</b>
                  </label>
                );
              })}
            </div>
          </section>
          <div className="contracts-readiness">
            <div><span>Team power</span><strong>{teamPower} / {selectedContract.recommendedPower}</strong></div>
            <div><span>Projected success</span><strong>{successChance}%</strong></div>
          </div>
          <button className="contracts-dispatch-button" disabled={!canDispatch} onClick={() => onStartExpedition(selectedContract.id, assignedCharacterIds)} type="button">
            {active ? "Expedition Already Active" : !availability.available ? availability.reasons[0] : !teamReady ? `Select ${selectedContract.minimumTeamSize}-${selectedContract.maximumTeamSize} Adventurers` : guild.gold < selectedContract.dispatchCost ? `Requires ${selectedContract.dispatchCost.toLocaleString("en-US")}g` : "Dispatch Expedition"}
          </button>
          <small className="contracts-local-note">Outcome is fixed when dispatched and cannot be rerolled by Save/Reload. No premium, payment or online service is used.</small>
        </aside>
      </div>

      <section className="contracts-history">
        <header className="ranking-section-heading"><div><span>Filed reports</span><h3>Recent Expeditions</h3></div><strong>Last 12</strong></header>
        {expeditions.history.length > 0 ? (
          <div>{expeditions.history.map((entry) => {
            const contract = getGuildContract(entry.contractId);
            return <article key={entry.id}><i>{contract?.sigil ?? "?"}</i><span><strong>{contract?.name ?? "Unknown contract"}</strong><small>{new Date(entry.completedAt).toLocaleString("en-US")}</small></span><b className={entry.success ? "is-success" : "is-failed"}>{entry.success ? `+${entry.goldGained}g / +${entry.renownGained} renown` : "No reward"}</b></article>;
          })}</div>
        ) : <p>No expedition reports filed yet.</p>}
      </section>
    </div>
  );
}

function ContractCard({ contract, guild, characters, selected, onSelect }: { contract: GuildContractDefinition; guild: Guild; characters: Character[]; selected: boolean; onSelect: () => void }) {
  const availability = getGuildContractAvailability(contract, guild, characters);
  return (
    <button aria-pressed={selected} className="contracts-card" onClick={onSelect} type="button">
      <i>{contract.sigil}</i>
      <span><small>{contract.region}</small><strong>{contract.name}</strong><em>{formatDuration(contract.durationMinutes)} / {formatRisk(contract.risk)}</em></span>
      <b>{availability.available ? `${contract.dispatchCost}g` : "Locked"}</b>
      <small>{availability.available ? `${contract.minimumTeamSize}-${contract.maximumTeamSize} adventurers` : availability.reasons[0]}</small>
    </button>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function formatItemReward(contract: GuildContractDefinition) {
  const item = contract.rewardItemId ? items[contract.rewardItemId] : undefined;
  return item ? `${item.name} x${contract.rewardItemQuantity ?? 1}` : "No material reward";
}

function formatDuration(minutes: number) {
  return minutes >= 60 ? `${minutes / 60}h` : `${minutes} min`;
}

function formatRisk(risk: GuildContractDefinition["risk"]) {
  return risk.charAt(0).toUpperCase() + risk.slice(1);
}

function formatCountdown(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1_000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
