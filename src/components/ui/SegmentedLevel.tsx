type Props = {
  label: string;
  levels: readonly string[];
  value?: number;
  onChange?: (value: number) => void;
};

export function SegmentedLevel({ label, levels, value, onChange }: Props) {
  const selected = value === undefined ? 0 : Math.round(value);
  const summary = value === undefined ? `${label}: sin calificar` : `${label}: ${levels[Math.max(0, selected - 1)]} (${value.toFixed(1)} de 5)`;

  if (!onChange) return <div className="segmented-level" role="img" aria-label={summary}>{levels.map((level, index) => <span key={level} className={index < selected ? 'filled' : ''} />)}</div>;

  return <div className="segmented-level segmented-level--input" role="radiogroup" aria-label={label}>{levels.map((level, index) => {
    const levelValue = index + 1;
    return <button key={level} type="button" className={levelValue <= selected ? 'filled' : ''} role="radio" aria-checked={levelValue === selected} aria-label={`${label}: ${level}`} onClick={() => onChange(levelValue)} />;
  })}</div>;
}
