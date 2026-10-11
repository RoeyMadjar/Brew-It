import { useId, useState } from "react";
import { formatRatio } from "../utils/format.js";
import { formToVersionFields } from "../utils/versionForm.js";

// Edit mode laid out like the expanded card: same grid, inputs instead of values.
function RecipeEditForm({
  initialValues,
  onSave,
  onCancel,
  subtitle,
  showRecipeFields = true,
  submitLabel = "Save Changes",
}) {
  const [formData, setFormData] = useState(initialValues);
  const id = useId();
  const isMinutes = formData.brewTimeUnit === "minutes";

  function handleChange(event) {
    // Every text input is required: block whitespace-only values too.
    if (event.target.type === "text") {
      event.target.setCustomValidity(
        event.target.value.trim() === "" ? "Please fill out this field." : "",
      );
    }
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    );
    onSave(trimmedData);
  }

  // Blur a number input on wheel so scrolling moves the page, not the value.
  function handleWheel(event) {
    if (event.target.type === "number") {
      event.target.blur();
    }
  }

  // Recipe-level forms (Create, Edit Recipe) get darker inputs than
  // version-level ones (New Version, Edit Version).
  return (
    <form
      className={
        showRecipeFields
          ? "recipe-edit-form recipe-level-form"
          : "recipe-edit-form"
      }
      onSubmit={handleSubmit}
      onWheel={handleWheel}
    >
      {showRecipeFields && (
        <input
          className="edit-name"
          type="text"
          name="name"
          aria-label="Recipe name"
          placeholder="Recipe's name"
          required
          value={formData.name}
          onChange={handleChange}
        />
      )}
      {subtitle && <p className="version-date">{subtitle}</p>}
      {showRecipeFields && (
        <>
          <p>
            <label>
              <strong>Bean:</strong>{" "}
              <input
                type="text"
                name="bean"
                required
                value={formData.bean}
                onChange={handleChange}
              />
            </label>
          </p>
          <p>
            <label>
              <strong>Method:</strong>{" "}
              <input
                type="text"
                name="method"
                required
                value={formData.method}
                onChange={handleChange}
              />
            </label>
          </p>
        </>
      )}

      <dl className="version-grid">
        <div className="version-field">
          <dt>
            <label htmlFor={`${id}-dose`}>Dose (g)</label>
          </dt>
          <dd>
            <input
              id={`${id}-dose`}
              type="number"
              name="doseGrams"
              required
              min="0"
              step="any"
              value={formData.doseGrams}
              onChange={handleChange}
            />
          </dd>
        </div>
        <div className="version-field">
          <dt>
            <label htmlFor={`${id}-yield`}>Yield (g)</label>
          </dt>
          <dd>
            <input
              id={`${id}-yield`}
              type="number"
              name="yieldGrams"
              step="any"
              value={formData.yieldGrams}
              onChange={handleChange}
            />
          </dd>
        </div>
        <div className="version-field">
          <dt>
            <label htmlFor={`${id}-brew-time`}>Brew time</label>
          </dt>
          <dd className="brew-time-input">
            <input
              id={`${id}-brew-time`}
              type="number"
              name="brewTime"
              step={isMinutes ? "any" : undefined}
              value={formData.brewTime}
              onChange={handleChange}
            />
            <select
              aria-label="Brew time unit"
              name="brewTimeUnit"
              value={formData.brewTimeUnit}
              onChange={handleChange}
            >
              <option value="seconds">sec</option>
              <option value="minutes">min</option>
            </select>
          </dd>
        </div>
        <div className="version-field">
          <dt>
            <label htmlFor={`${id}-rating`}>Rating (1–10)</label>
          </dt>
          <dd>
            <input
              id={`${id}-rating`}
              type="number"
              name="rating"
              min="1"
              max="10"
              step="0.5"
              value={formData.rating}
              onChange={handleChange}
            />
          </dd>
        </div>
      </dl>

      <dl className="version-grid">
        <div className="version-field">
          <dt>
            <label htmlFor={`${id}-grind`}>Grind size</label>
          </dt>
          <dd>
            <input
              id={`${id}-grind`}
              type="text"
              name="grindSize"
              required
              value={formData.grindSize}
              onChange={handleChange}
            />
          </dd>
        </div>
        <div className="version-field">
          <dt>
            <label htmlFor={`${id}-water`}>Water (g)</label>
          </dt>
          <dd>
            <input
              id={`${id}-water`}
              type="number"
              name="waterGrams"
              step="any"
              value={formData.waterGrams}
              onChange={handleChange}
            />
          </dd>
        </div>
        <div className="version-field">
          <dt>Ratio</dt>
          <dd>{formatRatio(formToVersionFields(formData))}</dd>
        </div>
        <div className="version-field">
          <dt>
            <label htmlFor={`${id}-temp`}>Temp (°C)</label>
          </dt>
          <dd>
            <input
              id={`${id}-temp`}
              type="number"
              name="waterTempC"
              step="any"
              value={formData.waterTempC}
              onChange={handleChange}
            />
          </dd>
        </div>
      </dl>

      <dl className="version-notes">
        <dt>
          <label htmlFor={`${id}-notes`}>Tasting notes</label>
        </dt>
        <dd>
          <textarea
            id={`${id}-notes`}
            name="tastingNotes"
            value={formData.tastingNotes}
            onChange={handleChange}
          />
        </dd>
      </dl>

      <div className="card-actions">
        <button type="submit">{submitLabel}</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default RecipeEditForm;
