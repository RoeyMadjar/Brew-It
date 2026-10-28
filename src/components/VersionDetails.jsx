import VersionField from "./VersionField.jsx";
import { getChangedFields } from "../utils/compare.js";
import { formatRatio, formatTemp } from "../utils/format.js";

// The rows under VersionSummary that show when a recipe or version is
// expanded. The summary always stays, so expanding only adds information.
function VersionDetails({ version, compareTo }) {
  const changed = compareTo ? getChangedFields(version, compareTo) : null;

  return (
    <>
      <dl className="rc__details">
        <VersionField
          label="Grind size"
          version={version}
          compareTo={compareTo}
          isChanged={changed?.grindSize}
          format={(v) => v.grindSize}
        />
        <VersionField
          label="Ratio"
          version={version}
          compareTo={compareTo}
          isChanged={changed?.ratio}
          format={formatRatio}
        />
        <VersionField
          // The ending hides on narrow cards (site.css), so phones read "Temp".
          label={
            <>
              Temp<span className="lbl-rest">erature</span>
            </>
          }
          version={version}
          compareTo={compareTo}
          isChanged={changed?.waterTempC}
          format={(v) => formatTemp(v.waterTempC)}
        />
      </dl>
      <dl className="rc__notes">
        <dt>Tasting notes</dt>
        <dd>{version.tastingNotes}</dd>
      </dl>
    </>
  );
}

export default VersionDetails;
