// Older recipes have no createdAt, so fall back to their first version's date.
export function getRecipeCreatedAt(recipe) {
  return recipe.createdAt ?? recipe.versions[0].createdAt;
}
