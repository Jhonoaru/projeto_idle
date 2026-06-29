import { ActivityLog } from "../log/ActivityLog";
import { Panel } from "../ui/Panel";
import type { ActivityLogEntry } from "../../shared/types";

interface RightPanelProps {
  logs: ActivityLogEntry[];
}

export function RightPanel({ logs }: RightPanelProps) {
  return (
    <aside className="right-panel">
      <Panel title="Activity">
        <ActivityLog logs={logs} />
      </Panel>
    </aside>
  );
}
