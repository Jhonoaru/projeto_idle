import { accesses } from "../../data/accesses";
import type { Character } from "../../shared/types";

interface AccessListProps {
  character: Character;
}

export function AccessList({ character }: AccessListProps) {
  const ownedAccesses = accesses.filter((access) => character.accessIds.includes(access.id));

  return (
    <div className="access-list">
      {ownedAccesses.length > 0 ? (
        ownedAccesses.map((access) => (
          <article className="access-key" key={access.id}>
            <strong>{access.name}</strong>
            <p>{access.description}</p>
          </article>
        ))
      ) : (
        <div className="empty-list">No access keys unlocked.</div>
      )}
    </div>
  );
}
