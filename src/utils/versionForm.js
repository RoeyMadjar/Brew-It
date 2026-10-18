import { secondsToMinutes } from "./format.js";

// Empty optional numbers are stored as null, not 0 (0 would look measured).
function toNumberOrNull(value) {
  return value === "" ? null : Number(value);
}

function toFormString(value) {
  return value === null ? "" : String(value);
}

function formToBrewTimeSeconds(formData) {
  if (formData.brewTime === "") {
    return null;
  }
  const multiplier = formData.brewTimeUnit === "minutes" ? 60 : 1;
  return Math.round(Number(formData.brewTime) * multiplier);
}

// Version data fields only: callers add or keep id and createdAt themselves.
export function formToVersionFields(formData) {
  return {
    doseGrams: Number(formData.doseGrams),
    grindSize: formData.grindSize,
    waterTempC: toNumberOrNull(formData.waterTempC),
    brewTimeSeconds: formToBrewTimeSeconds(formData),
    brewTimeUnit: formData.brewTimeUnit,
    yieldGrams: toNumberOrNull(formData.yieldGrams),
    rating: toNumberOrNull(formData.rating),
    tastingNotes: formData.tastingNotes,
  };
}

export function versionToFormValues(version) {
  const brewTimeUnit = version.brewTimeUnit ?? "seconds";

  return {
    doseGrams: String(version.doseGrams),
    grindSize: version.grindSize,
    waterTempC: toFormString(version.waterTempC),
    brewTime:
      brewTimeUnit === "minutes" && version.brewTimeSeconds !== null
        ? String(secondsToMinutes(version.brewTimeSeconds))
        : toFormString(version.brewTimeSeconds),
    brewTimeUnit,
    yieldGrams: toFormString(version.yieldGrams),
    rating: toFormString(version.rating),
    tastingNotes: version.tastingNotes,
  };
}
