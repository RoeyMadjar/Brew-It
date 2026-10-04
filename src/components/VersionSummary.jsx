import { formatBrewTime } from "../utils/format.js";

function VersionSummary({ version }) {
  return (
    <p className="version-summary">
      <span>
        <strong>Dose:</strong> {version.doseGrams} g
      </span>
      <span>
        <strong>Yield:</strong> {version.yieldGrams} g
      </span>
      <span>
        <strong>Brew time:</strong> {formatBrewTime(version)}
      </span>
      <span>
        <strong>Rating:</strong> {version.rating} / 10
      </span>
    </p>
  );
}

export default VersionSummary;
