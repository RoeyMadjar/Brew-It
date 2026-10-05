import { formatRatio } from "./format.js";

function normalizeText(text) {
  return text.trim().toLowerCase();
}

// Returns true for each field where version differs from current.
// Brew time compares seconds, so 180 sec and 3 min count as the same.
export function getChangedFields(version, current) {
  return {
    doseGrams: version.doseGrams !== current.doseGrams,
    waterGrams: version.waterGrams !== current.waterGrams,
    ratio: formatRatio(version) !== formatRatio(current),
    grindSize:
      normalizeText(version.grindSize) !== normalizeText(current.grindSize),
    waterTempC: version.waterTempC !== current.waterTempC,
    brewTime: version.brewTimeSeconds !== current.brewTimeSeconds,
    yieldGrams: version.yieldGrams !== current.yieldGrams,
    rating: version.rating !== current.rating,
  };
}
