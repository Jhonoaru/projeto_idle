interface CapacityBarProps {
  used: number;
  max: number;
}

export function CapacityBar({ used, max }: CapacityBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  const isWarning = percent >= 80;

  return (
    <div className={`capacity-bar ${isWarning ? "is-warning" : ""}`.trim()}>
      <div className="capacity-label">
        <span>Capacity</span>
        <strong>
          {used.toFixed(2)} / {max.toFixed(0)}
        </strong>
      </div>
      <div className="capacity-track" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
