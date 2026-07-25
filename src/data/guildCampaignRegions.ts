export interface GuildCampaignRegionDefinition {
  id: string;
  name: string;
  sigil: string;
  description: string;
  cities: string[];
  contractIds: string[];
}

export const guildCampaignRegions: GuildCampaignRegionDefinition[] = [
  {
    id: "thaeron-marches",
    name: "Thaeron Marches",
    sigil: "TM",
    description: "The guild's first roads, sewers and fortified approaches around Thaeron.",
    cities: ["Thaeron"],
    contractIds: ["contract-supply-route", "contract-sewer-ledger"],
  },
  {
    id: "khazgrim-frontier",
    name: "Khazgrim Frontier",
    sigil: "KF",
    description: "Iron roads, northern passes and the hard approaches to Khazgrim.",
    cities: ["Khazgrim"],
    contractIds: ["contract-iron-road", "contract-northern-cache"],
  },
  {
    id: "eldoria-reaches",
    name: "Eldoria Reaches",
    sigil: "ER",
    description: "Ancient crypts, ember territories and distant recovery routes tied to Eldoria.",
    cities: ["Eldoria"],
    contractIds: ["contract-marsh-recovery", "contract-vanguard-survey"],
  },
];

export function getGuildCampaignRegion(regionId: string) {
  return guildCampaignRegions.find((region) => region.id === regionId);
}

export function getGuildCampaignRegionByCity(city: string) {
  return guildCampaignRegions.find((region) => region.cities.includes(city));
}

export function getGuildCampaignRegionByContract(contractId: string) {
  return guildCampaignRegions.find((region) => region.contractIds.includes(contractId));
}
