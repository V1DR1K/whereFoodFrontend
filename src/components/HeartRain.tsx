import type { CSSProperties } from 'react';

const hearts = Array.from({ length: 44 }, (_, index) => ({
  delay: `${-(index * 1.37) % 18}s`,
  drift: `${((index * 29) % 34) - 17}vw`,
  duration: `${11 + (index % 7) * 1.45}s`,
  left: `${(index * 37) % 101}%`,
  size: `${15 + (index % 5) * 6}px`,
}));

export function HeartRain() {
  return <div className="heart-rain" aria-hidden="true">{hearts.map((heart, index) => <span key={index} style={{ '--heart-delay': heart.delay, '--heart-drift': heart.drift, '--heart-duration': heart.duration, '--heart-left': heart.left, '--heart-size': heart.size } as CSSProperties}>💖</span>)}</div>;
}
