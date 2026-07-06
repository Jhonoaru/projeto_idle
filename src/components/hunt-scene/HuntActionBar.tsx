interface HuntActionBarProps {
  label: string;
  progress: number;
}

export function HuntActionBar({ label, progress }: HuntActionBarProps) {
  return (
    <div className="hunt-scene-actionbar">
      <span>{label}</span>
      <div>
        <i style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
