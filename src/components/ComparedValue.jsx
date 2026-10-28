// Renders format(version). When isChanged, highlights it and adds the
// current value, formatted with the same function.
function ComparedValue({ version, compareTo, isChanged, format }) {
  if (!isChanged) {
    return <span className="bi-datafield__value">{format(version)}</span>;
  }

  return (
    <span className="bi-changed">
      <span className="bi-datafield__value bi-changed__value">
        <span className="bi-visually-hidden">Changed: </span>
        {format(version)}
      </span>
      <span className="bi-changed__now">
        now <b>{format(compareTo)}</b>
      </span>
    </span>
  );
}

export default ComparedValue;
