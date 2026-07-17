export const filmReviewMetrics = [
  { key: 'plot_complexity', label: 'Complejidad de trama y misterio', shortLabel: 'Complejidad', levels: ['Muy baja', 'Baja', 'Media', 'Alta', 'Muy alta'] },
  { key: 'story_development', label: 'Desarrollo de historia, personajes y vínculos', shortLabel: 'Desarrollo', levels: ['Muy pobre', 'Básico', 'Correcto', 'Muy bueno', 'Excelente'] },
] as const;

export const metricLevel = (levels: readonly string[], value?: number) => value === undefined ? 'Sin calificar' : levels[Math.max(0, Math.round(value) - 1)];
