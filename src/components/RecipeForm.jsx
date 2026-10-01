import { useState } from "react";

function RecipeForm({
  title,
  submitLabel,
  initialValues,
  onSave,
  onCancel,
  showRecipeFields = true,
}) {
  const [formData, setFormData] = useState(initialValues);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formData);
    setFormData(initialValues);
  }

  const dose = Number(formData.doseGrams);
  const water = Number(formData.waterGrams);
  const ratio = dose > 0 && water > 0 ? `1:${(water / dose).toFixed(1)}` : null;

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>

      {showRecipeFields && (
        <>
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
        </>
      )}

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

      <label>
        Brew time (seconds)
        <input
          type="number"
          name="brewTimeSeconds"
          value={formData.brewTimeSeconds}
          onChange={handleChange}
        />
      </label>

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
