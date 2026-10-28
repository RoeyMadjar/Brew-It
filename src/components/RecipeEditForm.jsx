import { useId, useState } from "react";
import { formatRatio } from "../utils/format.js";
import { formToVersionFields } from "../utils/versionForm.js";

// Edit mode laid out like the expanded card: name, bean and method on the
// left (recipe-level forms only), the brew values on the right.
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

  // Recipe-level forms (Create, Edit Recipe) get warm inputs, version-level
  // ones (New Version, Edit Version) cool ones (rf--recipe / rf--version).
  return (
    <form
      className={showRecipeFields ? "rf rf--recipe" : "rf rf--version"}
      onSubmit={handleSubmit}
      onWheel={handleWheel}
    >
      {showRecipeFields && (
        <div className="rf__identity">
          <div>
            <input
              className="bi-input bi-input--recipe rf__name"
              type="text"
              name="name"
              aria-label="Recipe name"
              placeholder="Recipe's name"
              required
              value={formData.name}
              onChange={handleChange}
            />
            {subtitle && <p className="rc__date">{subtitle}</p>}
          </div>
          <label className="bi-field">
            <span className="bi-field__label">Bean:</span>
            <input
              className="bi-input bi-input--recipe"
              type="text"
              name="bean"
              required
              value={formData.bean}
              onChange={handleChange}
            />
          </label>
          <label className="bi-field">
            <span className="bi-field__label">Method:</span>
            <input
              className="bi-input bi-input--recipe"
              type="text"
              name="method"
              required
              value={formData.method}
              onChange={handleChange}
            />
          </label>
        </div>
      )}

      <div className="rf__knobs">
        <div className="rf__row rf__row--a">
          <div className="bi-field">
            <label className="bi-field__label" htmlFor={`${id}-dose`}>
              Dose (g)
            </label>
            <input
              className="bi-input rf-input"
              id={`${id}-dose`}
              type="number"
              name="doseGrams"
              required
              min="0"
              step="any"
              value={formData.doseGrams}
              onChange={handleChange}
            />
          </div>
          <div className="bi-field">
            <label className="bi-field__label" htmlFor={`${id}-yield`}>
              Yield (g)
            </label>
            <input
              className="bi-input rf-input"
              id={`${id}-yield`}
              type="number"
              name="yieldGrams"
              step="any"
              value={formData.yieldGrams}
              onChange={handleChange}
            />
          </div>
          <div className="bi-field">
            <label className="bi-field__label" htmlFor={`${id}-brew-time`}>
              Brew time
            </label>
            <div className="rf__time">
              <input
                className="bi-input rf-input"
                id={`${id}-brew-time`}
                type="number"
                name="brewTime"
                step={isMinutes ? "any" : undefined}
                value={formData.brewTime}
                onChange={handleChange}
              />
              <select
                className="bi-input rf-input"
                aria-label="Brew time unit"
                name="brewTimeUnit"
                value={formData.brewTimeUnit}
                onChange={handleChange}
              >
                <option value="seconds">sec</option>
                <option value="minutes">min</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rf__row rf__row--b">
          <div className="bi-field">
            <label className="bi-field__label" htmlFor={`${id}-grind`}>
              Grind size
            </label>
            <input
              className="bi-input rf-input"
              id={`${id}-grind`}
              type="text"
              name="grindSize"
              required
              value={formData.grindSize}
              onChange={handleChange}
            />
          </div>
          <div className="bi-field">
            <span className="bi-field__label">Ratio</span>
            <output className="rf__ratio">
              {formatRatio(formToVersionFields(formData))}
            </output>
          </div>
          <div className="bi-field">
            <label className="bi-field__label" htmlFor={`${id}-temp`}>
              Temp (°C)
            </label>
            <input
              className="bi-input rf-input"
              id={`${id}-temp`}
              type="number"
              name="waterTempC"
              step="any"
              value={formData.waterTempC}
              onChange={handleChange}
            />
          </div>
          <div className="bi-field">
            <label className="bi-field__label" htmlFor={`${id}-rating`}>
              Rating (1–10)
            </label>
            <input
              className="bi-input rf-input"
              id={`${id}-rating`}
              type="number"
              name="rating"
              min="1"
              max="10"
              step="0.5"
              value={formData.rating}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="bi-field">
          <label className="bi-field__label" htmlFor={`${id}-notes`}>
            Tasting notes
          </label>
          <textarea
            className="bi-input rf-input"
            id={`${id}-notes`}
            name="tastingNotes"
            rows="3"
            value={formData.tastingNotes}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="rf__actions">
        <button type="submit" className="bi-btn bi-btn--primary bi-btn--sm">
          {submitLabel}
        </button>
        <button
          type="button"
          className="bi-btn bi-btn--quiet bi-btn--sm"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default RecipeEditForm;
