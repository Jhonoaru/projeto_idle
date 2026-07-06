interface HuntSceneLogProps {
  lines: string[];
}

export function HuntSceneLog({ lines }: HuntSceneLogProps) {
  return (
    <div className="hunt-scene-log">
      <span>Combat Log</span>
      {lines.slice(-8).map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
    </div>
  );
}
