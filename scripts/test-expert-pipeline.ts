import { expertFeedbackPipeline } from '../src/lib/expert-pipeline';

async function runLocalTest() {
    console.log("=== QLIKNDEAL EXPERT PIPELINE TEST ===");
    const query = "אייפון 13 עם 256GB";
    console.log(`Input Query: "${query}"\n`);
    
    try {
        const result = await expertFeedbackPipeline(query);
        console.log("\n[TEST RESULT] Successfully processed query!");
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("\n[TEST ERROR]", e);
    }
}

runLocalTest().catch(console.error);
