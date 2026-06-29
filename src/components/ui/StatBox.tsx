interface StatBoxProps {
  label: string;
  value: string | number;
  detail?: string;
}

export function StatBox({ label, value, detail }: StatBoxProps) {
  return (
    <div className="stat-box">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}
