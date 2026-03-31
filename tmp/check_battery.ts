import { masterAnalyze } from "@/lib/analyze";

async function test() {
    const text = "אפל מקבוק מושלם, סוללה פצצה 86 אחוז בריאות. כונן 512 טוס מהר לקנות!";
    const analysis = await masterAnalyze(text, "LAPTOPS");
    console.dir(analysis, { depth: null });
}

test();
