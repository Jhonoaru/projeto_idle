import { CharacterCard } from "./CharacterCard";
import type { Character } from "../../shared/types";

interface CharacterListProps {
  characters: Character[];
  selectedCharacterId: string;
  onSelectCharacter: (characterId: string) => void;
}

export function CharacterList({
  characters,
  selectedCharacterId,
  onSelectCharacter,
}: CharacterListProps) {
  return (
    <div className="character-list">
      {characters.map((character) => (
        <CharacterCard
          character={character}
          isSelected={character.id === selectedCharacterId}
          key={character.id}
          onSelect={() => onSelectCharacter(character.id)}
        />
      ))}
    </div>
  );
}
