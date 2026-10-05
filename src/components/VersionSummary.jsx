import VersionField from "./VersionField.jsx";
import { getChangedFields } from "../utils/compare.js";
import { formatBrewTime, formatGrams, formatRating } from "../utils/format.js";

function VersionSummary({ version, compareTo }) {
  const changed = compareTo ? getChangedFields(version, compareTo) : null;

  return (
    <dl className="version-grid">
      <VersionField
        label="Dose"
        version={version}
        compareTo={compareTo}
        isChanged={changed?.doseGrams}
        format={(v) => formatGrams(v.doseGrams)}
      />
      <VersionField
        label="Yield"
        version={version}
        compareTo={compareTo}
        isChanged={changed?.yieldGrams}
        format={(v) => formatGrams(v.yieldGrams)}
      />
      <VersionField
        label="Brew time"
        version={version}
        compareTo={compareTo}
        isChanged={changed?.brewTime}
        format={formatBrewTime}
      />
      <VersionField
        label="Rating"
        version={version}
        compareTo={compareTo}
        isChanged={changed?.rating}
        format={(v) => formatRating(v.rating)}
      />
    </dl>
  );
}

export default VersionSummary;
