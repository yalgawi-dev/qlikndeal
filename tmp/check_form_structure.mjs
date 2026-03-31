import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const structure = await p.categoryFormStructure.findMany({
    where: { category: "LAPTOPS" },
    orderBy: { order: "asc" },
    select: { fieldId: true, labelHera: true, sectionName: true }
});

console.log("=== LAPTOPS Form Structure (fieldId → label) ===");
structure.forEach(f => console.log(`  fieldId: "${f.fieldId}"  label: "${f.labelHera}"  section: "${f.sectionName}"`));

const options = await p.formFieldOption.findMany({
    where: { category: "LAPTOPS" },
    select: { fieldId: true, value: true },
    orderBy: { fieldId: "asc" }
});

console.log("\n=== LAPTOPS Dropdown Options ===");
const grouped = {};
options.forEach(o => { if (!grouped[o.fieldId]) grouped[o.fieldId] = []; grouped[o.fieldId].push(o.value); });
Object.entries(grouped).forEach(([field, vals]) => console.log(`  fieldId: "${field}" → [${vals.join(", ")}]`));

await p.$disconnect();
