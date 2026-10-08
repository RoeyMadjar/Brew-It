import { useId, useState } from "react";

function RecipeForm({ title, submitLabel, initialValues, onSave, onCancel }) {
  const [formData, setFormData] = useState(initialValues);
  const brewTimeId = useId();
  const isMinutes = formData.brewTimeUnit === "minutes";

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formData);
    setFormData(initialValues);
  }

  // Blur a number input on wheel so scrolling moves the page, not the value.
  function handleWheel(event) {
    if (event.target.type === "number") {
      event.target.blur();
    }
  }

  const dose = Number(formData.doseGrams);
  const water = Number(formData.waterGrams);
  const ratio = dose > 0 && water > 0 ? `1:${(water / dose).toFixed(1)}` : null;

  return (
    <form className="recipe-form" onSubmit={handleSubmit} onWheel={handleWheel}>
      <h2>{title}</h2>

      <label>
        Name
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </label>

      <label>
        Bean
        <input
          type="text"
          name="bean"
          value={formData.bean}
          onChange={handleChange}
        />
      </label>

      <label>
        Method
        <input
          type="text"
          name="method"
          value={formData.method}
          onChange={handleChange}
        />
      </label>

      <label>
        Dose (g)
        <input
          type="number"
          name="doseGrams"
          value={formData.doseGrams}
          onChange={handleChange}
        />
      </label>

      <label>
        Water (g)
        <input
          type="number"
          name="waterGrams"
          value={formData.waterGrams}
          onChange={handleChange}
        />
      </label>

      {ratio && <p className="ratio">Ratio: {ratio}</p>}

      <label>
        Grind size
        <input
          type="text"
          name="grindSize"
          value={formData.grindSize}
          onChange={handleChange}
        />
      </label>

      <label>
        Temperature (°C)
        <input
          type="number"
          name="waterTempC"
          value={formData.waterTempC}
          onChange={handleChange}
        />
      </label>

      <div className="brew-time-field">
        <div className="brew-time-header">
          <label htmlFor={brewTimeId}>Brew time</label>
          <select
            aria-label="Brew time unit"
            name="brewTimeUnit"
            value={formData.brewTimeUnit}
            onChange={handleChange}
          >
            <option value="seconds">sec</option>
            <option value="minutes">min</option>
          </select>
        </div>
        <input
          id={brewTimeId}
          type="number"
          name="brewTime"
          step={isMinutes ? "any" : undefined}
          value={formData.brewTime}
          onChange={handleChange}
        />
      </div>

      <label>
        Yield (g)
        <input
          type="number"
          name="yieldGrams"
          value={formData.yieldGrams}
          onChange={handleChange}
        />
      </label>

      <label>
        Rating (1–10)
        <input
          type="number"
          name="rating"
          min="1"
          max="10"
          step="0.5"
          value={formData.rating}
          onChange={handleChange}
        />
      </label>

      <label>
        Tasting notes
        <textarea
          name="tastingNotes"
          value={formData.tastingNotes}
          onChange={handleChange}
        />
      </label>

      <button type="submit">{submitLabel}</button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default RecipeForm;
