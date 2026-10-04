import { secondsToMinutes } from "./format.js";

function formToBrewTimeSeconds(formData) {
  const multiplier = formData.brewTimeUnit === "minutes" ? 60 : 1;
  return Math.round(Number(formData.brewTime) * multiplier);
}

// Version data fields only: callers add or keep id and createdAt themselves.
export function formToVersionFields(formData) {
  return {
    doseGrams: Number(formData.doseGrams),
    waterGrams: Number(formData.waterGrams),
    grindSize: formData.grindSize,
    waterTempC: Number(formData.waterTempC),
    brewTimeSeconds: formToBrewTimeSeconds(formData),
    brewTimeUnit: formData.brewTimeUnit,
    yieldGrams: Number(formData.yieldGrams),
    rating: Number(formData.rating),
    tastingNotes: formData.tastingNotes,
  };
}

export function versionToFormValues(version) {
  const brewTimeUnit = version.brewTimeUnit ?? "seconds";

  return {
    doseGrams: String(version.doseGrams),
    waterGrams: String(version.waterGrams),
    grindSize: version.grindSize,
    waterTempC: String(version.waterTempC),
    brewTime:
      brewTimeUnit === "minutes"
        ? String(secondsToMinutes(version.brewTimeSeconds))
        : String(version.brewTimeSeconds),
    brewTimeUnit,
    yieldGrams: String(version.yieldGrams),
    rating: String(version.rating),
    tastingNotes: version.tastingNotes,
  };
}
