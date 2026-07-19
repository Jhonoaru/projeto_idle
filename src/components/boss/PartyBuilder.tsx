import { getAccessName } from "../../data/accesses";
import type { Boss, BossParty, Character, PartyRole } from "../../shared/types";

const roles: PartyRole[] = ["tank", "healer", "damage", "support"];

interface PartyBuilderProps {
  boss: Boss;
  characters: Character[];
  party: BossParty;
  onToggleMember: (characterId: string) => void;
  onChangeRole: (characterId: string, role: PartyRole) => void;
}

export function PartyBuilder({
  boss,
  characters,
  party,
  onToggleMember,
  onChangeRole,
}: PartyBuilderProps) {
  return (
    <div className="party-builder">
      {characters.map((character) => {
        const member = party.members.find((entry) => entry.characterId === character.id);
        const hasAccess =
          !boss.requirements.requiredAccessIds ||
          boss.requirements.requiredAccessIds.every((accessId) =>
            character.accessIds.includes(accessId),
          );
        const accessText = hasAccess
          ? "Access ok"
          : `Requer ${boss.requirements.requiredAccessIds?.map(getAccessName).join(", ")}`;
        const hasCooldown = character.bossCooldowns.some(
          (entry) => entry.bossId === boss.id && Date.parse(entry.availableAt) > Date.now(),
        );
        const eligible = character.status === "idle"
          && character.level >= boss.requirements.requiredLevel
          && hasAccess
          && !hasCooldown;
        const eligibilityText = eligible
          ? accessText
          : hasCooldown
            ? "Cooldown active"
            : character.status !== "idle"
              ? `Busy: ${character.status}`
              : character.level < boss.requirements.requiredLevel
                ? `Requires level ${boss.requirements.requiredLevel}`
                : accessText;

        return (
          <article className={`party-row ${member ? "is-selected" : ""}`} key={character.id}>
            <div>
              <strong>{character.name}</strong>
              <span>
                Lv {character.level} {character.vocation} - {character.status}
              </span>
              <small>{eligibilityText}</small>
            </div>
            <select
              disabled={!member}
              onChange={(event) => onChangeRole(character.id, event.target.value as PartyRole)}
              value={member?.role ?? "damage"}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button disabled={!member && !eligible} onClick={() => onToggleMember(character.id)} type="button">
              {member ? "Remover" : "Adicionar"}
            </button>
          </article>
        );
      })}
    </div>
  );
}
