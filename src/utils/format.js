export function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function secondsToMinutes(seconds) {
  return Number((seconds / 60).toFixed(2));
}

// Versions saved before brewTimeUnit existed have no unit: treat them as seconds.
export function formatBrewTime(version) {
  if ((version.brewTimeUnit ?? "seconds") === "minutes") {
    return `${secondsToMinutes(version.brewTimeSeconds)} min`;
  }
  return `${version.brewTimeSeconds} sec`;
}

export function formatRatio(version) {
  if (version.doseGrams > 0 && version.waterGrams > 0) {
    return `1:${(version.waterGrams / version.doseGrams).toFixed(1)}`;
  }
  return "—";
}
