import type { GuildSpecialistDefinition } from "../shared/types";

export const guildSpecialists: GuildSpecialistDefinition[] = [
  {
    id: "scout_captain",
    name: "Mara Veld",
    title: "Scout Captain",
    description: "Reviews routes and threat reports before a support team leaves the hall.",
    sigil: "SC",
    bonusType: "expedition_success",
    bonusValue: 5,
    bonusLabel: "+5 success chance",
    hireCost: 250,
    minimumCareerPoints: 0,
    requiredFacilityId: "war_room",
    requiredFacilityLevel: 1,
  },
  {
    id: "provisioner",
    name: "Oren Vale",
    title: "Guild Provisioner",
    description: "Prepares compact supply manifests and lowers the cost of every dispatch.",
    sigil: "PV",
    bonusType: "dispatch_discount",
    bonusValue: 10,
    bonusLabel: "-10% dispatch cost",
    hireCost: 500,
    minimumCareerPoints: 100,
    requiredFacilityId: "quartermaster",
    requiredFacilityLevel: 1,
  },
  {
    id: "guild_envoy",
    name: "Elira Sorn",
    title: "Guild Envoy",
    description: "Negotiates stronger local stipends for successful expedition reports.",
    sigil: "GE",
    bonusType: "expedition_gold",
    bonusValue: 10,
    bonusLabel: "+10% expedition gold",
    hireCost: 900,
    minimumCareerPoints: 200,
    requiredFacilityId: "contract_archive",
    requiredFacilityLevel: 2,
  },
  {
    id: "field_medic",
    name: "Brother Cael",
    title: "Field Medic",
    description: "Organizes recovery details that earn one additional renown on successful work.",
    sigil: "FM",
    bonusType: "expedition_renown",
    bonusValue: 1,
    bonusLabel: "+1 expedition renown",
    hireCost: 1_200,
    minimumCareerPoints: 300,
    requiredFacilityId: "training_yard",
    requiredFacilityLevel: 2,
  },
];

export function getGuildSpecialist(specialistId: string | null | undefined) {
  return guildSpecialists.find((specialist) => specialist.id === specialistId);
}
