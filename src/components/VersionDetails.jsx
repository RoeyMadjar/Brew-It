import VersionField from "./VersionField.jsx";
import VersionSummary from "./VersionSummary.jsx";
import { getChangedFields } from "../utils/compare.js";
import { formatGrams, formatRatio, formatTemp } from "../utils/format.js";

function VersionDetails({ version, compareTo }) {
  const changed = compareTo ? getChangedFields(version, compareTo) : null;

  return (
    <>
      {/* Row 1 is the summary itself, so expanding only adds information. */}
      <VersionSummary version={version} compareTo={compareTo} />
      <dl className="version-grid">
        <VersionField
          label="Grind size"
          version={version}
          compareTo={compareTo}
          isChanged={changed?.grindSize}
          format={(v) => v.grindSize}
        />
        <VersionField
          label="Water"
          version={version}
          compareTo={compareTo}
          isChanged={changed?.waterGrams}
          format={(v) => formatGrams(v.waterGrams)}
        />
        <VersionField
          label="Ratio"
          version={version}
          compareTo={compareTo}
          isChanged={changed?.ratio}
          format={formatRatio}
        />
        <VersionField
          label="Temperature"
          version={version}
          compareTo={compareTo}
          isChanged={changed?.waterTempC}
          format={(v) => formatTemp(v.waterTempC)}
        />
      </dl>
      <dl className="version-notes">
        <dt>Tasting notes</dt>
        <dd>{version.tastingNotes}</dd>
      </dl>
    </>
  );
}

export default VersionDetails;
