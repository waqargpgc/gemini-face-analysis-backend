export function level(score) {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "moderate";
  if (score >= 0.2) return "mild";
  return "low";
}

export function skinType(f) {
  if (f.oiliness > 0.7 && f.dryness < 0.3) return "oily";
  if (f.dryness > 0.7) return "dry";
  if (f.oiliness > 0.5 && f.dryness > 0.5) return "combination";
  return "normal";
}

export function skinHealth(f) {
  const avg =
    Object.values(f).reduce((a, b) => a + (1 - b), 0) /
    Object.keys(f).length;

  if (avg > 0.75) return "excellent";
  if (avg > 0.6) return "good";
  if (avg > 0.4) return "fair";
  return "poor";
}

export function confidence(imageQuality, f) {
  const signal =
    Object.values(f).reduce((a, b) => a + b, 0) /
    Object.keys(f).length;

  return Number((imageQuality * 0.7 + signal * 0.3).toFixed(2));
}
