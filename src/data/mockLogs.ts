import type { ActivityLogEntry } from "../shared/types";

export const mockLogs: ActivityLogEntry[] = [
  {
    id: "log-001",
    timestamp: "20:42",
    title: "Contract completed",
    message: "Ayla returned from Wolfpine Road with 85 gold.",
    tone: "success",
  },
  {
    id: "log-002",
    timestamp: "20:37",
    title: "Training report",
    message: "Mira improved her magic control during relic practice.",
    tone: "neutral",
  },
  {
    id: "log-003",
    timestamp: "20:31",
    title: "Risk warning",
    message: "Blackroot Crypt is above the current party power curve.",
    tone: "warning",
  },
  {
    id: "log-004",
    timestamp: "20:24",
    title: "Guild upkeep",
    message: "Aurora paid for supplies and repaired worn equipment.",
    tone: "neutral",
  },
];
