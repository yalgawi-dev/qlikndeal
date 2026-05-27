import { MOTHERBOARD_DATABASE } from "../src/lib/motherboard-database";
import * as fs from 'fs';
import * as path from 'path';

function cleanMotherboards() {
  console.log("Starting test cleanup of motherboards...");
  let fixedCount = 0;
  let skippedCount = 0;
  let matchedASUS = 0;
  let matchedGigabyte = 0;
  let matchedMSI = 0;
  let matchedASRock = 0;
  let matchedNZXT = 0;
  let matchedEVGA = 0;
  let unknownCount = 0;

  const cleaned = MOTHERBOARD_DATABASE.map((item: any, idx: number) => {
    const fakeBrand = item.brand;
    const model = item.model;

    // Strip the fake brand prefix
    let strippedModel = model;
    if (model.startsWith(fakeBrand + " ")) {
      strippedModel = model.substring(fakeBrand.length + 1);
    }

    const modelUpper = strippedModel.toUpperCase();
    let realBrand = fakeBrand;

    // Classification logic based on series keywords
    if (
      modelUpper.includes("ROG") ||
      modelUpper.includes("STRIX") ||
      modelUpper.includes("PRIME") ||
      modelUpper.includes("TUF") ||
      modelUpper.includes("PROART") ||
      modelUpper.includes("MAXIMUS") ||
      modelUpper.includes("HERO") ||
      modelUpper.includes("APEX") ||
      modelUpper.includes("CROSSHAIR")
    ) {
      realBrand = "ASUS";
      matchedASUS++;
    } else if (
      modelUpper.includes("AORUS") ||
      modelUpper.includes("AERO") ||
      modelUpper.includes("DS3H") ||
      modelUpper.includes("GAMING X") ||
      modelUpper.includes("UD") ||
      modelUpper.includes("ULTRA DURABLE") ||
      (modelUpper.includes("GAMING") && !modelUpper.includes("TUF") && !modelUpper.includes("PHANTOM") && !modelUpper.includes("PG"))
    ) {
      realBrand = "Gigabyte";
      matchedGigabyte++;
    } else if (
      modelUpper.includes("MPG") ||
      modelUpper.includes("MAG") ||
      modelUpper.includes("MEG") ||
      modelUpper.includes("TOMAHAWK") ||
      modelUpper.includes("MORTAR") ||
      modelUpper.includes("CARBON") ||
      modelUpper.includes("GODLIKE") ||
      modelUpper.includes("ACE") ||
      modelUpper.includes("UNIFY") ||
      modelUpper.includes("CREATOR") ||
      // Matches "PRO B...", "PRO Z...", "PRO H..." (MSI series)
      /\bPRO [BZH]\d/.test(modelUpper)
    ) {
      realBrand = "MSI";
      matchedMSI++;
    } else if (
      modelUpper.includes("TAICHI") ||
      modelUpper.includes("STEEL LEGEND") ||
      modelUpper.includes("PHANTOM") ||
      modelUpper.includes("RIPTIDE") ||
      modelUpper.includes("LIVEMIXER") ||
      modelUpper.includes("PRO RS") ||
      modelUpper.includes("PRO4") ||
      modelUpper.includes("PG")
    ) {
      realBrand = "ASRock";
      matchedASRock++;
    } else if (
      modelUpper.includes("N7") ||
      modelUpper.includes("N5")
    ) {
      realBrand = "NZXT";
      matchedNZXT++;
    } else if (
      modelUpper.includes("DARK") ||
      modelUpper.includes("CLASSIFIED") ||
      modelUpper.includes("FTW")
    ) {
      realBrand = "EVGA";
      matchedEVGA++;
    } else {
      // If none matched, keep as is
      unknownCount++;
    }

    const newModel = `${realBrand} ${strippedModel}`;
    if (realBrand !== fakeBrand) {
      fixedCount++;
      if (idx < 15) {
        console.log(`FIXED [${idx}]: "${model}" (Fake: ${fakeBrand}) -> "${newModel}" (Real: ${realBrand})`);
      }
    } else {
      skippedCount++;
    }

    return {
      ...item,
      brand: realBrand,
      model: newModel
    };
  });

  console.log("\n--- Summary ---");
  console.log(`Total processed: ${cleaned.length}`);
  console.log(`Fixed brands/models: ${fixedCount}`);
  console.log(`Unchanged/Correct: ${skippedCount}`);
  console.log(`Unknown series: ${unknownCount}`);
  console.log("\n--- Real Brands breakdown ---");
  console.log(`ASUS: ${matchedASUS}`);
  console.log(`Gigabyte: ${matchedGigabyte}`);
  console.log(`MSI: ${matchedMSI}`);
  console.log(`ASRock: ${matchedASRock}`);
  console.log(`NZXT: ${matchedNZXT}`);
  console.log(`EVGA: ${matchedEVGA}`);
}

cleanMotherboards();
