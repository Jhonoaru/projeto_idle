import { CHARACTER_STATUS_LABELS } from "../../shared/constants";
import { ActionAnalyzer } from "./ActionAnalyzer";
import { CurrentActionBox } from "../character/CurrentActionBox";
import { Panel } from "../ui/Panel";
import type { Boss, BossParty, Character, HuntArea, Quest } from "../../shared/types";

interface ActionPanelProps {
  selectedCharacter: Character;
  characters: Character[];
  hunts: HuntArea[];
  quests: Quest[];
  bosses: Boss[];
  bossParty: BossParty;
  onCancelAction: () => void;
  onFinishTravel: () => void;
  onFinishHunt: () => void;
  onFinishTraining: () => void;
  onFinishQuest: (quest: Quest) => void;
  onFinishBoss: () => void;
  onChangeTab: (tab: "hunts" | "quests" | "bosses" | "training") => void;
}

export function ActionPanel({
  selectedCharacter,
  characters,
  hunts,
  quests,
  bosses,
  bossParty,
  onCancelAction,
  onFinishTravel,
  onFinishHunt,
  onFinishTraining,
  onFinishQuest,
  onFinishBoss,
  onChangeTab,
}: ActionPanelProps) {
  const action = selectedCharacter.currentAction;
  const currentQuest = quests.find((quest) => quest.id === action?.targetId);

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
        <CurrentActionBox
          character={selectedCharacter}
          onCancelAction={onCancelAction}
          onFinishTravel={onFinishTravel}
        />
      </Panel>

      <Panel title="Action Analyzer">
        <ActionAnalyzer
          bossParty={bossParty}
          bosses={bosses}
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
              finishLabel="Finalizar Simulacao"
              onCancel={onCancelAction}
              onFinish={onFinishHunt}
            />
          ) : null}

          {selectedCharacter.status === "training" ? (
            <ActionButtons
              finishLabel="Finalizar Treino"
              onCancel={onCancelAction}
              onFinish={onFinishTraining}
            />
          ) : null}

          {selectedCharacter.status === "questing" ? (
            currentQuest ? (
              <ActionButtons
                finishLabel="Finalizar Quest"
                onCancel={onCancelAction}
                onFinish={() => onFinishQuest(currentQuest)}
              />
            ) : (
              <p className="action-block-reason">Quest atual nao encontrada.</p>
            )
          ) : null}

          {selectedCharacter.status === "bossing" ? (
            <ActionButtons
              finishLabel="Finalizar Boss"
              onCancel={onCancelAction}
              onFinish={onFinishBoss}
            />
          ) : null}

          {selectedCharacter.status === "traveling" ? (
            <div className="hunt-action-buttons">
              <button onClick={onFinishTravel} type="button">Finalizar Viagem</button>
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
}: {
  finishLabel: string;
  onFinish: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="hunt-action-buttons">
      <button onClick={onFinish} type="button">{finishLabel}</button>
      <button onClick={onCancel} type="button">Cancelar e Retornar</button>
    </div>
  );
}
