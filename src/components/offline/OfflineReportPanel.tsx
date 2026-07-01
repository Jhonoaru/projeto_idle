import { formatDuration } from "../../shared/time";
import type { OfflineCatchUpReport } from "../../shared/types";

interface OfflineReportPanelProps {
  report?: OfflineCatchUpReport;
  onDismiss: () => void;
  onGoToAction: () => void;
}

export function OfflineReportPanel({
  report,
  onDismiss,
  onGoToAction,
}: OfflineReportPanelProps) {
  if (!report || report.characterReports.length === 0) return null;

  return (
    <section className="offline-report-panel">
      <div>
        <span>Offline Progress</span>
        <strong>{formatDuration(report.consideredOfflineMs)} considered</strong>
        <p>
          Real offline time: {formatDuration(report.totalOfflineMs)}. Actions are resolved once,
          and rewards wait for collection when needed.
        </p>
      </div>
      <ul>
        {report.characterReports.map((entry) => (
          <li key={`${entry.characterId}-${entry.actionType}-${entry.actionLabel}`}>
            {entry.message}
          </li>
        ))}
      </ul>
      <div className="hunt-action-buttons">
        <button onClick={onGoToAction} type="button">Go to Action</button>
        <button onClick={onDismiss} type="button">Ok</button>
      </div>
    </section>
  );
}
