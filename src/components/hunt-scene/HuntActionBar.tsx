interface HuntActionBarProps {
  label: string;
  progress: number;
}

export function HuntActionBar({ label, progress }: HuntActionBarProps) {
  const safeProgress = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;

  return (
    <div className="hunt-scene-actionbar">
      <span>{label}</span>
      <div>
        <i style={{ width: `${Math.round(safeProgress * 100)}%` }} />
      </div>
    </div>
  );
}
