interface QuestResultPanelProps {
  result?: {
    success: boolean;
    died: boolean;
    accessUnlocked?: string;
    logs: string[];
  };
}

export function QuestResultPanel({ result }: QuestResultPanelProps) {
  if (!result) return null;

  return (
    <div className="quest-result-panel">
      <div className="result-title-row">
        <strong>{result.success ? "Quest Complete" : "Quest Failed"}</strong>
        <span>{result.died ? "Dead" : result.success ? "Success" : "Failed"}</span>
        <em>{result.accessUnlocked ? "Access" : "Result"}</em>
      </div>
      <div className="result-section">
        <ul>
          {result.logs.map((log) => (
            <li key={log}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
