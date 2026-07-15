import { useMemo, useState } from "react";
import { guildSpecialists, getGuildSpecialist } from "../../data/guildSpecialists";
import { getGuildFacility } from "../../data/guildFacilities";
import { getGuildCareer } from "../../game-engine/achievements/getGuildCareer";
import { normalizeGuildExpeditionState } from "../../game-engine/expeditions/normalizeGuildExpeditionState";
import { getGuildSpecialistAvailability } from "../../game-engine/staff/manageGuildStaff";
import { normalizeGuildStaffState } from "../../game-engine/staff/normalizeGuildStaffState";
import type { Character, Guild, GuildSpecialistDefinition, GuildSpecialistId } from "../../shared/types";

interface GuildStaffHallProps {
  characters: Character[];
  guild: Guild;
  onAssignSpecialist: (specialistId: GuildSpecialistId | null) => void;
  onHireSpecialist: (specialistId: GuildSpecialistId) => void;
}

export function GuildStaffHall({ characters, guild, onAssignSpecialist, onHireSpecialist }: GuildStaffHallProps) {
  const staff = useMemo(() => normalizeGuildStaffState(guild.staff), [guild.staff]);
  const career = useMemo(() => getGuildCareer(guild, characters), [characters, guild]);
  const expedition = useMemo(() => normalizeGuildExpeditionState(guild.expeditions).activeExpedition, [guild.expeditions]);
  const [selectedId, setSelectedId] = useState<GuildSpecialistId>(staff.activeSpecialistId ?? guildSpecialists[0].id);
  const selected = getGuildSpecialist(selectedId) ?? guildSpecialists[0];
  const availability = getGuildSpecialistAvailability(guild, characters, selected.id);
  const active = staff.activeSpecialistId === selected.id;
  const expeditionSpecialist = getGuildSpecialist(expedition?.specialistId);

  return (
    <div className="staff-hall">
      <section className="staff-hero">
        <div className="staff-crest" aria-hidden="true"><i>S</i><span>{staff.hiredSpecialistIds.length}/4</span></div>
        <div className="staff-identity">
          <span>Headquarters personnel office</span>
          <h3>{guild.name} Guild Staff</h3>
          <p>Hire permanent local specialists and assign one officer to support the guild's next expedition.</p>
        </div>
        <div className="staff-summary">
          <Summary label="Hired" value={`${staff.hiredSpecialistIds.length}/4`} />
          <Summary label="On duty" value={getGuildSpecialist(staff.activeSpecialistId)?.title ?? "Unassigned"} />
          <Summary label="Invested" value={`${staff.totalSpentGold.toLocaleString("en-US")}g`} />
          <Summary label="Career points" value={String(career.points)} />
        </div>
      </section>

      {expedition ? (
        <section className="staff-dispatch-notice">
          <span>Active expedition</span>
          <strong>{expeditionSpecialist ? `${expeditionSpecialist.name} is attached to this dispatch` : "No specialist attached"}</strong>
          <small>Duty changes apply only to expeditions dispatched afterward.</small>
        </section>
      ) : null}

      <div className="staff-workspace">
        <section className="staff-roster">
          <header className="ranking-section-heading"><div><span>Local candidates</span><h3>Specialist Roster</h3></div><strong>One active post</strong></header>
          <div className="staff-card-grid">
            {guildSpecialists.map((specialist) => (
              <SpecialistCard
                active={staff.activeSpecialistId === specialist.id}
                hired={staff.hiredSpecialistIds.includes(specialist.id)}
                key={specialist.id}
                onSelect={() => setSelectedId(specialist.id)}
                selected={specialist.id === selected.id}
                specialist={specialist}
              />
            ))}
          </div>
        </section>

        <aside className="staff-dossier">
          <header className="ranking-section-heading"><div><span>Personnel dossier</span><h3>{selected.name}</h3></div><strong>{availability.hired ? "Hired" : "Candidate"}</strong></header>
          <div className="staff-profile">
            <i>{selected.sigil}</i>
            <div><span>{selected.title}</span><strong>{selected.bonusLabel}</strong><small>{selected.description}</small></div>
          </div>
          <div className="staff-requirements">
            <Summary label="Retainer" value={`${selected.hireCost.toLocaleString("en-US")}g`} />
            <Summary label="Career" value={`${selected.minimumCareerPoints} points`} />
            <Summary label="Facility" value={`${getGuildFacility(selected.requiredFacilityId)?.name ?? "Guild Hall"} Lv ${selected.requiredFacilityLevel}`} />
          </div>
          <div className="staff-assignment">
            <span>Duty order</span>
            <strong>{active ? "Currently on duty" : availability.hired ? "Available for assignment" : "Contract required"}</strong>
            <small>Only one specialist bonus can affect a new expedition. Existing dispatches keep their original officer and values.</small>
          </div>
          {availability.hired ? (
            <button className="staff-command" disabled={active} onClick={() => onAssignSpecialist(selected.id)} type="button">
              {active ? "Specialist On Duty" : "Assign to Duty"}
            </button>
          ) : (
            <button className="staff-command" disabled={!availability.available} onClick={() => onHireSpecialist(selected.id)} type="button">
              {availability.available ? `Hire for ${selected.hireCost.toLocaleString("en-US")}g` : availability.reasons[0]}
            </button>
          )}
          {staff.activeSpecialistId ? <button className="staff-clear-command" onClick={() => onAssignSpecialist(null)} type="button">Clear Active Post</button> : null}
          <small className="staff-local-note">Staff is guild-wide, offline and permanent. There is no payroll timer, premium currency, payment or online service.</small>
        </aside>
      </div>
    </div>
  );
}

function SpecialistCard({ specialist, hired, active, selected, onSelect }: { specialist: GuildSpecialistDefinition; hired: boolean; active: boolean; selected: boolean; onSelect: () => void }) {
  return (
    <button aria-pressed={selected} className={`staff-card ${active ? "is-active" : ""}`} onClick={onSelect} type="button">
      <i>{specialist.sigil}</i>
      <span><small>{specialist.title}</small><strong>{specialist.name}</strong><em>{specialist.bonusLabel}</em></span>
      <b>{active ? "On duty" : hired ? "Hired" : `${specialist.hireCost.toLocaleString("en-US")}g`}</b>
    </button>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
