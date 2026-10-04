import { formatBrewTime, formatRatio } from "../utils/format.js";

function VersionDetails({ version }) {
  return (
    <>
      <p>
        <strong>Dose:</strong> {version.doseGrams} g
      </p>
      <p>
        <strong>Water:</strong> {version.waterGrams} g
      </p>
      <p>
        <strong>Ratio:</strong> {formatRatio(version)}
      </p>
      <p>
        <strong>Grind size:</strong> {version.grindSize}
      </p>
      <p>
        <strong>Temperature:</strong> {version.waterTempC} °C
      </p>
      <p>
        <strong>Brew time:</strong> {formatBrewTime(version)}
      </p>
      <p>
        <strong>Yield:</strong> {version.yieldGrams} g
      </p>
      <p>
        <strong>Rating:</strong> {version.rating} / 10
      </p>
      <p>
        <strong>Tasting notes:</strong> {version.tastingNotes}
      </p>
    </>
  );
}

export default VersionDetails;
