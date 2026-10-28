import ComparedValue from "./ComparedValue.jsx";

// One grid cell: label on top, (compared) value below.
function VersionField({ label, version, compareTo, isChanged, format }) {
  return (
    <div className="bi-datafield">
      <dt className="bi-datafield__label">{label}</dt>
      <dd>
        <ComparedValue
          version={version}
          compareTo={compareTo}
          isChanged={isChanged}
          format={format}
        />
      </dd>
    </div>
  );
}

export default VersionField;
