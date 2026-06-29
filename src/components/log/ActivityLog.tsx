import type { ActivityLogEntry } from "../../shared/types";

interface ActivityLogProps {
  logs: ActivityLogEntry[];
}

export function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="activity-log">
      {logs.map((log) => (
        <article className={`log-entry log-${log.tone}`} key={log.id}>
          <time>{log.timestamp}</time>
          <h3>{log.title}</h3>
          <p>{log.message}</p>
        </article>
      ))}
    </div>
  );
}
