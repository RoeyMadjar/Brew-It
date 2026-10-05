import ComparedValue from "./ComparedValue.jsx";
import { getChangedFields } from "../utils/compare.js";
import { formatBrewTime } from "../utils/format.js";

function VersionSummary({ version, compareTo }) {
  const changed = compareTo ? getChangedFields(version, compareTo) : null;

  return (
    <p className="version-summary">
      <span>
        <strong>Dose:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.doseGrams}
          format={(v) => `${v.doseGrams} g`}
        />
      </span>
      <span>
        <strong>Yield:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.yieldGrams}
          format={(v) => `${v.yieldGrams} g`}
        />
      </span>
      <span>
        <strong>Brew time:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.brewTime}
          format={formatBrewTime}
        />
      </span>
      <span>
        <strong>Rating:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.rating}
          format={(v) => `${v.rating} / 10`}
        />
      </span>
    </p>
  );
}

export default VersionSummary;
