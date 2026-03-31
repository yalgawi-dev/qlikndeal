import { masterAnalyze } from "./src/lib/analyze";

async function main() {
    console.log("Starting masterAnalyze test...");
    
    // Listing example for RTX 4080
    const text = `מחשב נייד גיימינג לגיימרים מפלצת!
Gigabyte AORUS 17X AXF
מעבד i9-13980HX עוצמתי
כרטיס מסך מטורף RTX 4080 12GB
מסך 17.3 אינץ' 240Hz
זיכרון 32GB RAM DDR5
אחסון 1TB SSD
מחשב חדש לגמרי באריזה, עולה בחנות 15,000 ש"ח.
דורש רק 10,000 ש"ח סופי! לא בשבת.`;

    const result = await masterAnalyze(text, "LAPTOPS");
    console.log("FINAL RESULT:", JSON.stringify(result, null, 2));
    process.exit(0);
}

main().catch(e => {
    console.error("Error running test:", e);
    process.exit(1);
});
