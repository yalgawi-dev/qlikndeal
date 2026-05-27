import { MOTHERBOARD_DATABASE } from "../src/lib/motherboard-database";

console.log("Total motherboards:", MOTHERBOARD_DATABASE.length);

const brands: Record<string, number> = {};
const chipsets: Record<string, number> = {};

MOTHERBOARD_DATABASE.forEach((mb: any, idx: number) => {
  brands[mb.brand] = (brands[mb.brand] || 0) + 1;
  chipsets[mb.chipset] = (chipsets[mb.chipset] || 0) + 1;
  if (idx < 20) {
    console.log(`${idx}: Brand: ${mb.brand} | Model: ${mb.model} | Chipset: ${mb.chipset}`);
  }
});

console.log("\nBrands:", brands);
console.log("\nChipsets count:", Object.keys(chipsets).length);
