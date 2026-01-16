export function getAvoidTags(skinType) {
  if (skinType === "oily") {
    return ["coconut_oil", "isopropyl_myristate"];
  }
  if (skinType === "sensitive") {
    return ["fragrance", "alcohol_denat"];
  }
  return [];
}
