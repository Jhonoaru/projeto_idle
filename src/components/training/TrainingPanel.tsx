import { useEffect, useMemo, useState } from "react";
import { trainingOptions } from "../../data/trainingOptions";
import { VOCATION_CONFIGS } from "../../data/vocations";
import { getMainSkill } from "../../game-engine/character/getMainSkill";
import { calculateTrainingGain } from "../../game-engine/progression/calculateTrainingGain";
import { SKILL_LABELS } from "../../shared/constants";
import { TrainingOptionCard } from "./TrainingOptionCard";
import { TrainingResultPanel } from "./TrainingResultPanel";
import type { TrainingResult } from "../../game-services/trainingService";
import type { Character, TrainingTarget } from "../../shared/types";

const trainingTargets: TrainingTarget[] = [
  "sword",
  "axe",
  "club",
  "distance",
  "fist",
  "shielding",
  "magic",
];

interface TrainingPanelProps {
  character: Character;
  lastResult?: TrainingResult;
  onStartTraining: (
    targetSkill: TrainingTarget,
    type: "offline" | "exercise" | "dummy",
    durationMinutes: number,
    cost: number,
  ) => void;
  onFinishTraining: () => void;
  guildGold: number;
  onOpenSkills: () => void;
}

export function TrainingPanel({
  character,
  lastResult,
  onStartTraining,
  onFinishTraining,
  guildGold,
  onOpenSkills,
}: TrainingPanelProps) {
  const mainSkill = getMainSkill(character);
  const [targetSkill, setTargetSkill] = useState<TrainingTarget>(mainSkill.name);
  const [trainingType, setTrainingType] = useState<"offline" | "exercise">("offline");
  const isTraining = character.status === "training";
  const isBusy = character.status !== "idle";
  const currentTrainingSkill = character.currentAction?.targetSkill;
  const selectedSkill = currentTrainingSkill ?? targetSkill;
  const selectedSkillState = character.skills[selectedSkill];
  const vocation = VOCATION_CONFIGS[character.vocation];

  useEffect(() => {
    setTargetSkill(getMainSkill(character).name);
  }, [character.id]);

  const optionsWithGain = useMemo(
    () =>
      trainingOptions.filter((option) => option.type === trainingType).map((option) => ({
        option,
        expectedGain: calculateTrainingGain(
          character,
          selectedSkill,
          option.durationMinutes,
          option.type,
        ),
      })),
    [character, selectedSkill, trainingType],
  );

  return (
    <div className="training-hall">
      <section className="training-hall-hero">
        <div className="training-hall-seal"><span>{skillCode(selectedSkill)}</span><small>Lv {selectedSkillState.level}</small></div>
        <div className="training-hall-title">
          <span>{character.vocation} / Training Grounds</span>
          <h2>{character.name}'s Training Hall</h2>
          <p>Choose a discipline and a local training session. Progress is applied only when the session is resolved.</p>
          <button onClick={onOpenSkills} type="button">Return to Skill Hall</button>
        </div>
        <div className="training-hall-summary">
          <div><span>Selected skill</span><strong>{SKILL_LABELS[selectedSkill]} {selectedSkillState.level}</strong></div>
          <div><span>Progress</span><strong>{selectedSkillState.progressPercent}%</strong></div>
          <div><span>Guild gold</span><strong>{guildGold.toLocaleString("en-US")}g</strong></div>
          <div><span>Status</span><strong>{isTraining ? "Training" : isBusy ? character.status : "Ready"}</strong></div>
        </div>
      </section>

      {isTraining ? (
        <section className="training-hall-session">
          <div><span>Active session</span><strong>{character.currentAction?.label}</strong><p>{character.currentAction?.startedAt} - {character.currentAction?.endsAt}</p></div>
          <div><span>Discipline</span><strong>{SKILL_LABELS[selectedSkill]}</strong><p>The result remains pending until manually resolved.</p></div>
          <button onClick={onFinishTraining} type="button">Finish simulated training</button>
        </section>
      ) : null}

      <div className="training-hall-layout">
        <section className="training-hall-skills">
          <header><strong>Choose Discipline</strong><span>Permanent skill progression</span></header>
          <div className="training-hall-skill-grid">
            {trainingTargets.map((skillName) => {
              const skillState = character.skills[skillName];
              const recommended = vocation.mainSkills.includes(skillName);
              return (
                <button className={`${selectedSkill === skillName ? "is-selected" : ""} ${recommended ? "is-recommended" : ""}`.trim()} disabled={isBusy} key={skillName} onClick={() => setTargetSkill(skillName)} type="button">
                  <span>{skillCode(skillName)}</span><div><strong>{SKILL_LABELS[skillName]}</strong><small>{recommended ? "Vocation path" : "Secondary discipline"}</small></div><em>Lv {skillState.level}</em>
                  <i><b style={{ width: `${skillState.progressPercent}%` }} /></i>
                </button>
              );
            })}
          </div>
        </section>

        <section className="training-hall-programs">
          <header><div><strong>Training Programs</strong><span>Select duration and intensity</span></div><nav aria-label="Training mode"><button className={trainingType === "offline" ? "is-selected" : ""} onClick={() => setTrainingType("offline")} type="button">Offline</button><button className={trainingType === "exercise" ? "is-selected" : ""} onClick={() => setTrainingType("exercise")} type="button">Exercise</button></nav></header>
          <div className="training-options-grid">
            {optionsWithGain.map(({ option, expectedGain }) => (
              <TrainingOptionCard
                disabled={isBusy || (option.type === "exercise" && guildGold < option.cost)}
                expectedGain={expectedGain}
                key={option.id}
                onStart={() => onStartTraining(selectedSkill, option.type, option.durationMinutes, option.cost)}
                option={option}
                targetSkill={selectedSkill}
              />
            ))}
          </div>
          {isBusy && !isTraining ? <p className="training-hall-blocked">{character.name} cannot train while {character.status}.</p> : null}
        </section>
      </div>

      <TrainingResultPanel result={lastResult} />
    </div>
  );
}

function skillCode(skill: TrainingTarget) {
  return ({ sword: "SW", axe: "AX", club: "CL", distance: "DS", fist: "FS", shielding: "SH", magic: "MG" } as const)[skill];
}
