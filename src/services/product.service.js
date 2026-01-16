const PRODUCTS = [
  {
    id: 1,
    name: "Gentle Cleanser",
    brand: "CeraVe",
    type: "cleanser",
    ingredients: ["ceramides", "niacinamide"],
    reason: "Maintains skin barrier",
  },
  {
    id: 2,
    name: "Oil Control Gel",
    brand: "La Roche-Posay",
    type: "moisturizer",
    ingredients: ["zinc", "niacinamide"],
    reason: "Controls excess oil",
  },
];

export function matchProducts(avoidTags) {
  return PRODUCTS.filter(
    (p) => !p.ingredients.some((i) => avoidTags.includes(i))
  ).slice(0, 3);
}
