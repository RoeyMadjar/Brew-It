// Renders format(version). When isChanged, highlights it and adds the
// current value, formatted with the same function.
function ComparedValue({ version, compareTo, isChanged, format }) {
  if (!isChanged) {
    return format(version);
  }

  return (
    <>
      <mark className="changed-value">{format(version)}</mark>{" "}
      <span className="now-value">(now {format(compareTo)})</span>
    </>
  );
}

export default ComparedValue;
