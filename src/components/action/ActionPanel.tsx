import { CHARACTER_STATUS_LABELS } from "../../shared/constants";
import { ActionAnalyzer } from "./ActionAnalyzer";
import { CurrentActionBox } from "../character/CurrentActionBox";
import { DeathPanel } from "../death/DeathPanel";
import { Panel } from "../ui/Panel";
import type { Boss, BossParty, Character, GuildBestiaryState, HuntArea, Quest } from "../../shared/types";

interface ActionPanelProps {
  selectedCharacter: Character;
  characters: Character[];
  hunts: HuntArea[];
  quests: Quest[];
  bosses: Boss[];
  bossParty: BossParty;
  bestiary?: GuildBestiaryState;
  onCancelAction: () => void;
  onFinishTravel: () => void;
  onFinishHunt: () => void;
  onFinishTraining: () => void;
  onFinishQuest: (quest: Quest) => void;
  onFinishBoss: () => void;
  onReviveCharacter: () => void;
  onStopHuntAutoRepeat: () => void;
  onChangeTab: (tab: "hunts" | "quests" | "bosses" | "training") => void;
}

export function ActionPanel({
  selectedCharacter,
  characters,
  hunts,
  quests,
  bosses,
  bossParty,
  bestiary,
  onCancelAction,
  onFinishTravel,
  onFinishHunt,
  onFinishTraining,
  onFinishQuest,
  onFinishBoss,
  onReviveCharacter,
  onStopHuntAutoRepeat,
  onChangeTab,
}: ActionPanelProps) {
  const action = selectedCharacter.currentAction;
  const currentQuest = quests.find((quest) => quest.id === action?.targetId);
  const isReadyToResolve = action?.readyToResolve === true;

  return (
    <div className="action-panel">
      <Panel title="Resumo">
        <div className="action-character-summary">
          <div>
            <span>Personagem</span>
            <strong>{selectedCharacter.name}</strong>
          </div>
          <div>
            <span>Vocacao</span>
            <strong>{selectedCharacter.vocation}</strong>
          </div>
          <div>
            <span>Level</span>
            <strong>{selectedCharacter.level}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{CHARACTER_STATUS_LABELS[selectedCharacter.status]}</strong>
          </div>
          <div>
            <span>Cidade</span>
            <strong>{selectedCharacter.city}</strong>
          </div>
        </div>
      </Panel>

      <Panel title="Current Action">
        {selectedCharacter.status === "dead" ? (
          <DeathPanel character={selectedCharacter} onRevive={onReviveCharacter} />
        ) : (
          <CurrentActionBox
            character={selectedCharacter}
            onCancelAction={onCancelAction}
            onFinishTravel={onFinishTravel}
          />
        )}
      </Panel>

      <Panel title="Action Analyzer">
        <ActionAnalyzer
          bossParty={bossParty}
          bosses={bosses}
          bestiary={bestiary}
          character={selectedCharacter}
          characters={characters}
          hunts={hunts}
          quests={quests}
        />
      </Panel>

      <Panel title="Controles">
        <div className="action-control-panel">
          {selectedCharacter.status === "idle" ? (
            <>
              <p>Nenhuma acao em andamento.</p>
              <div className="hunt-action-buttons">
                <button onClick={() => onChangeTab("hunts")} type="button">Ir para Hunts</button>
                <button onClick={() => onChangeTab("quests")} type="button">Ir para Quests</button>
                <button onClick={() => onChangeTab("bosses")} type="button">Ir para Bosses</button>
                <button onClick={() => onChangeTab("training")} type="button">Ir para Treino</button>
              </div>
            </>
          ) : null}

          {selectedCharacter.status === "hunting" ? (
            <ActionButtons
              finishLabel={isReadyToResolve ? "Coletar resultado da Hunt" : "Finalizar Simulacao"}
              onCancel={onCancelAction}
              onFinish={onFinishHunt}
              onStopAutoRepeat={action?.autoRepeat?.enabled ? onStopHuntAutoRepeat : undefined}
              showCancel={!isReadyToResolve}
            />
          ) : null}

          {selectedCharacter.status === "training" ? (
            <ActionButtons
              finishLabel={isReadyToResolve ? "Coletar treino" : "Finalizar Treino"}
              onCancel={onCancelAction}
              onFinish={onFinishTraining}
              showCancel={!isReadyToResolve}
            />
          ) : null}

          {selectedCharacter.status === "questing" ? (
            currentQuest ? (
              <ActionButtons
                finishLabel={isReadyToResolve ? "Concluir Quest" : "Finalizar Quest"}
                onCancel={onCancelAction}
                onFinish={() => onFinishQuest(currentQuest)}
                showCancel={!isReadyToResolve}
              />
            ) : (
              <p className="action-block-reason">Quest atual nao encontrada.</p>
            )
          ) : null}

          {selectedCharacter.status === "bossing" ? (
            <ActionButtons
              finishLabel={isReadyToResolve ? "Coletar resultado do Boss" : "Finalizar Boss"}
              onCancel={onCancelAction}
              onFinish={onFinishBoss}
              showCancel={!isReadyToResolve}
            />
          ) : null}

          {selectedCharacter.status === "traveling" ? (
            <div className="hunt-action-buttons">
              <button onClick={onFinishTravel} type="button">Finalizar Viagem</button>
            </div>
          ) : null}

          {selectedCharacter.status === "dead" ? (
            <div className="hunt-action-buttons">
              <button onClick={onReviveCharacter} type="button">Reviver no Templo</button>
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function ActionButtons({
  finishLabel,
  onFinish,
  onCancel,
  onStopAutoRepeat,
  showCancel = true,
}: {
  finishLabel: string;
  onFinish: () => void;
  onCancel: () => void;
  onStopAutoRepeat?: () => void;
  showCancel?: boolean;
}) {
  return (
    <div className="hunt-action-buttons">
      <button onClick={onFinish} type="button">{finishLabel}</button>
      {onStopAutoRepeat ? <button onClick={onStopAutoRepeat} type="button">Parar Auto-repeat</button> : null}
      {showCancel ? <button onClick={onCancel} type="button">Cancelar e Retornar</button> : null}
    </div>
  );
}
