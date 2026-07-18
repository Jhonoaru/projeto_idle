export const CLIENT_PREFERENCES_STORAGE_KEY = "guild-hunt-idle.client-preferences.v1";
export const CLIENT_LAST_VIEW_STORAGE_KEY = "guild-hunt-idle.last-view.v1";

export const CLIENT_STARTUP_VIEWS = ["character", "hunts", "wiki"] as const;
export type ClientStartupView = (typeof CLIENT_STARTUP_VIEWS)[number];

export const CLIENT_RESTORABLE_VIEWS = [
  "character",
  "operations",
  "headquarters",
  "contracts",
  "staff",
  "treasury",
  "projects",
  "logistics",
  "recruitment",
  "skills",
  "blessings",
  "proficiency",
  "focus",
  "destiny",
  "collections",
  "action",
  "atlas",
  "hunts",
  "inventory",
  "equipment",
  "depot",
  "market",
  "forge",
  "imbuing",
  "training",
  "quests",
  "bosses",
  "bestiary",
  "daily",
  "ranking",
  "store",
  "updates",
  "wiki",
  "settings",
] as const;

export type ClientRestorableView = (typeof CLIENT_RESTORABLE_VIEWS)[number];
export type ClientDensity = "comfortable" | "compact";
export type ClientTextScale = 90 | 100 | 110;

export interface ClientPreferences {
  density: ClientDensity;
  textScale: ClientTextScale;
  reduceMotion: boolean;
  showActivityFeed: boolean;
  showTopbarSaveControls: boolean;
  restoreLastView: boolean;
  startupView: ClientStartupView;
}

export const DEFAULT_CLIENT_PREFERENCES: ClientPreferences = {
  density: "comfortable",
  textScale: 100,
  reduceMotion: false,
  showActivityFeed: true,
  showTopbarSaveControls: true,
  restoreLastView: false,
  startupView: "character",
};

export function normalizeClientPreferences(value: unknown): ClientPreferences {
  const source = isRecord(value) ? value : {};

  return {
    density: source.density === "compact" ? "compact" : "comfortable",
    textScale: source.textScale === 90 || source.textScale === 110 ? source.textScale : 100,
    reduceMotion: source.reduceMotion === true,
    showActivityFeed: source.showActivityFeed !== false,
    showTopbarSaveControls: source.showTopbarSaveControls !== false,
    restoreLastView: source.restoreLastView === true,
    startupView: isStartupView(source.startupView) ? source.startupView : "character",
  };
}

export function loadClientPreferences(): ClientPreferences {
  try {
    const stored = window.localStorage.getItem(CLIENT_PREFERENCES_STORAGE_KEY);
    return stored ? normalizeClientPreferences(JSON.parse(stored)) : DEFAULT_CLIENT_PREFERENCES;
  } catch {
    return DEFAULT_CLIENT_PREFERENCES;
  }
}

export function saveClientPreferences(preferences: ClientPreferences) {
  try {
    window.localStorage.setItem(
      CLIENT_PREFERENCES_STORAGE_KEY,
      JSON.stringify(normalizeClientPreferences(preferences)),
    );
  } catch {
    // The client remains usable with in-memory preferences when storage is unavailable.
  }
}

export function applyClientPreferences(preferences: ClientPreferences) {
  const root = document.documentElement;
  root.dataset.clientDensity = preferences.density;
  root.dataset.clientTextScale = String(preferences.textScale);
  root.dataset.clientMotion = preferences.reduceMotion ? "reduced" : "full";
}

export function loadLastClientView(): ClientRestorableView | undefined {
  try {
    const stored = window.localStorage.getItem(CLIENT_LAST_VIEW_STORAGE_KEY);
    return isRestorableView(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

export function saveLastClientView(view: string) {
  if (!isRestorableView(view)) return;

  try {
    window.localStorage.setItem(CLIENT_LAST_VIEW_STORAGE_KEY, view);
  } catch {
    // Last-view restoration is optional and must never block navigation.
  }
}

export function isClientPreferenceStorageAvailable() {
  try {
    const probeKey = `${CLIENT_PREFERENCES_STORAGE_KEY}.probe`;
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

function isStartupView(value: unknown): value is ClientStartupView {
  return CLIENT_STARTUP_VIEWS.includes(value as ClientStartupView);
}

function isRestorableView(value: unknown): value is ClientRestorableView {
  return CLIENT_RESTORABLE_VIEWS.includes(value as ClientRestorableView);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
