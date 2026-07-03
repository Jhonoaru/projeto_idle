import { HuntCard } from "./HuntCard";
import { Panel } from "../ui/Panel";
import type { Character, HuntArea } from "../../shared/types";

interface HuntListProps {
  hunts: HuntArea[];
  character: Character;
  selectedHuntId?: string;
  onSelectHunt: (hunt: HuntArea) => void;
}

export function HuntList({ hunts, character, selectedHuntId, onSelectHunt }: HuntListProps) {
  return (
    <Panel title="Available Hunts">
      <div className="hunt-list">
        {hunts.map((hunt) => (
          <HuntCard
            character={character}
            hunt={hunt}
            hasAccess={!hunt.requiredAccess || character.accessIds.includes(hunt.requiredAccess)}
            isSelected={hunt.id === selectedHuntId}
            key={hunt.id}
            onSelect={() => onSelectHunt(hunt)}
          />
        ))}
      </div>
    </Panel>
  );
}
