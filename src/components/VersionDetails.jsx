import ComparedValue from "./ComparedValue.jsx";
import { getChangedFields } from "../utils/compare.js";
import { formatBrewTime, formatRatio } from "../utils/format.js";

function VersionDetails({ version, compareTo }) {
  const changed = compareTo ? getChangedFields(version, compareTo) : null;

  return (
    <>
      <p>
        <strong>Dose:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.doseGrams}
          format={(v) => `${v.doseGrams} g`}
        />
      </p>
      <p>
        <strong>Water:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.waterGrams}
          format={(v) => `${v.waterGrams} g`}
        />
      </p>
      <p>
        <strong>Ratio:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.ratio}
          format={formatRatio}
        />
      </p>
      <p>
        <strong>Grind size:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.grindSize}
          format={(v) => v.grindSize}
        />
      </p>
      <p>
        <strong>Temperature:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.waterTempC}
          format={(v) => `${v.waterTempC} °C`}
        />
      </p>
      <p>
        <strong>Brew time:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.brewTime}
          format={formatBrewTime}
        />
      </p>
      <p>
        <strong>Yield:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.yieldGrams}
          format={(v) => `${v.yieldGrams} g`}
        />
      </p>
      <p>
        <strong>Rating:</strong>{" "}
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={changed?.rating}
          format={(v) => `${v.rating} / 10`}
        />
      </p>
      <p>
        <strong>Tasting notes:</strong> {version.tastingNotes}
      </p>
    </>
  );
}

export default VersionDetails;
