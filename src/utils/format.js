export function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function secondsToMinutes(seconds) {
  return Number((seconds / 60).toFixed(2));
}

// Empty optional values are null and show as "—".
// Versions saved before brewTimeUnit existed have no unit: treat them as seconds.
export function formatBrewTime(version) {
  if (version.brewTimeSeconds === null) {
    return "—";
  }
  if ((version.brewTimeUnit ?? "seconds") === "minutes") {
    return `${secondsToMinutes(version.brewTimeSeconds)}min`;
  }
  return `${version.brewTimeSeconds}s`;
}

export function formatGrams(grams) {
  if (grams === null) {
    return "—";
  }
  return `${grams}g`;
}

export function formatTemp(celsius) {
  if (celsius === null) {
    return "—";
  }
  return `${celsius}°C`;
}

export function formatRating(rating) {
  if (rating === null) {
    return "—";
  }
  return `${rating}/10`;
}

export function formatRatio(version) {
  if (version.doseGrams > 0 && version.yieldGrams > 0) {
    return `1:${(version.yieldGrams / version.doseGrams).toFixed(1)}`;
  }
  return "—";
}
