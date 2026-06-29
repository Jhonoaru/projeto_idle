import { CharacterList } from "../character/CharacterList";
import { Panel } from "../ui/Panel";
import type { Character } from "../../shared/types";

interface LeftPanelProps {
  characters: Character[];
  selectedCharacterId: string;
  onSelectCharacter: (characterId: string) => void;
}

export function LeftPanel({
  characters,
  selectedCharacterId,
  onSelectCharacter,
}: LeftPanelProps) {
  return (
    <aside className="left-panel">
      <Panel title="Roster">
        <CharacterList
          characters={characters}
          selectedCharacterId={selectedCharacterId}
          onSelectCharacter={onSelectCharacter}
        />
      </Panel>
    </aside>
  );
}
