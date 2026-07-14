import { useState, type ReactNode } from "react";

import {
  CLIENT_STARTUP_VIEWS,
  type ClientPreferences,
  type ClientStartupView,
  isClientPreferenceStorageAvailable,
} from "../../client-preferences/clientPreferences";

interface SettingsHallProps {
  preferences: ClientPreferences;
  saveStatus?: string;
  onChange: (updates: Partial<ClientPreferences>) => void;
  onManualSave: () => void;
  onReloadSave: () => void;
  onResetPreferences: () => void;
  onResetSave: () => void;
}

const STARTUP_VIEW_LABELS: Record<ClientStartupView, string> = {
  character: "Character Hall",
  hunts: "Explore",
  wiki: "Guild Codex",
};

export function SettingsHall({
  preferences,
  saveStatus,
  onChange,
  onManualSave,
  onReloadSave,
  onResetPreferences,
  onResetSave,
}: SettingsHallProps) {
  const saveBusy = Boolean(saveStatus?.endsWith("..."));
  const [storageAvailable] = useState(isClientPreferenceStorageAvailable);

  return (
    <section className="settings-hall">
      <header className="settings-hall-hero">
        <div className="settings-hall-sigil" aria-hidden="true">CFG</div>
        <div className="settings-hall-title">
          <span>Local client console</span>
          <h2>Client Settings</h2>
          <p>Configure this installation without changing guild progress or combat data.</p>
        </div>
        <div className="settings-hall-summary" aria-label="Client profile summary">
          <SettingsMetric label="Profile" value="Local" />
          <SettingsMetric label="Application" value="Immediate" />
          <SettingsMetric label="Guild save" value="Separate" />
        </div>
      </header>

      <div className="settings-hall-notice">
        <span className={storageAvailable ? "is-ready" : "is-warning"} aria-hidden="true" />
        <strong>{storageAvailable ? "Local profile ready" : "Memory-only profile"}</strong>
        <p>
          {storageAvailable
            ? "Preferences are stored on this device and never enter the SQLite guild save."
            : "Browser storage is unavailable; changes last only until this client closes."}
        </p>
      </div>

      <div className="settings-hall-grid">
        <section className="settings-hall-section">
          <div className="settings-section-heading">
            <span>01 / Interface</span>
            <h3>Client Presentation</h3>
          </div>

          <SettingsRow label="Interface density" note="Changes spacing across the main client shell.">
            <div className="settings-segmented" role="group" aria-label="Interface density">
              <ChoiceButton
                active={preferences.density === "comfortable"}
                label="Comfortable"
                onClick={() => onChange({ density: "comfortable" })}
              />
              <ChoiceButton
                active={preferences.density === "compact"}
                label="Compact"
                onClick={() => onChange({ density: "compact" })}
              />
            </div>
          </SettingsRow>

          <SettingsRow label="Text scale" note="Applies to rem-based interface text and controls.">
            <div className="settings-segmented" role="group" aria-label="Text scale">
              {([90, 100, 110] as const).map((scale) => (
                <ChoiceButton
                  active={preferences.textScale === scale}
                  key={scale}
                  label={`${scale}%`}
                  onClick={() => onChange({ textScale: scale })}
                />
              ))}
            </div>
          </SettingsRow>

          <ToggleRow
            checked={preferences.reduceMotion}
            label="Reduce motion"
            note="Disables decorative transitions, pulses and smooth scrolling."
            onChange={(checked) => onChange({ reduceMotion: checked })}
          />
          <ToggleRow
            checked={preferences.showActivityFeed}
            label="Show activity feed"
            note="Keeps the recent guild activity panel in the character sidebar."
            onChange={(checked) => onChange({ showActivityFeed: checked })}
          />
          <ToggleRow
            checked={preferences.showTopbarSaveControls}
            label="Topbar save controls"
            note="Shows compact Save, Reload and Reset commands in the Topbar."
            onChange={(checked) => onChange({ showTopbarSaveControls: checked })}
          />
        </section>

        <section className="settings-hall-section">
          <div className="settings-section-heading">
            <span>02 / Startup</span>
            <h3>Client Entry</h3>
          </div>

          <SettingsRow label="Default screen" note="Used when last-view restoration is disabled.">
            <select
              aria-label="Default startup screen"
              disabled={preferences.restoreLastView}
              onChange={(event) => onChange({ startupView: event.target.value as ClientStartupView })}
              value={preferences.startupView}
            >
              {CLIENT_STARTUP_VIEWS.map((view) => (
                <option key={view} value={view}>{STARTUP_VIEW_LABELS[view]}</option>
              ))}
            </select>
          </SettingsRow>

          <ToggleRow
            checked={preferences.restoreLastView}
            label="Restore last screen"
            note="Reopens the last supported hall when the client starts again."
            onChange={(checked) => onChange({ restoreLastView: checked })}
          />

          <div className="settings-local-profile">
            <span>Client profile</span>
            <strong>Device-only preferences</strong>
            <p>Resetting this profile does not remove characters, equipment, gold or progression.</p>
            <button className="settings-secondary-command" onClick={onResetPreferences} type="button">
              Restore client defaults
            </button>
          </div>
        </section>

        <section className="settings-hall-section settings-save-vault">
          <div className="settings-section-heading">
            <span>03 / SQLite vault</span>
            <h3>Guild Save</h3>
          </div>
          <div className="settings-save-status">
            <span>Current status</span>
            <strong>{saveStatus ?? "SQLite local save"}</strong>
            <p>These commands operate on guild progression and remain separate from client preferences.</p>
          </div>
          <div className="settings-save-actions">
            <button disabled={saveBusy} onClick={onManualSave} type="button">Save now</button>
            <button disabled={saveBusy} onClick={onReloadSave} type="button">Reload save</button>
            <button className="is-danger" disabled={saveBusy} onClick={onResetSave} type="button">Reset guild save</button>
          </div>
        </section>
      </div>
    </section>
  );
}

function SettingsMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SettingsRow({
  children,
  label,
  note,
}: {
  children: ReactNode;
  label: string;
  note: string;
}) {
  return (
    <div className="settings-row">
      <div>
        <strong>{label}</strong>
        <span>{note}</span>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  checked,
  label,
  note,
  onChange,
}: {
  checked: boolean;
  label: string;
  note: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="settings-row settings-toggle-row">
      <div>
        <strong>{label}</strong>
        <span>{note}</span>
      </div>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span className="settings-toggle" aria-hidden="true"><i /></span>
    </label>
  );
}

function ChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={active ? "is-active" : ""} onClick={onClick} type="button">
      {label}
    </button>
  );
}
