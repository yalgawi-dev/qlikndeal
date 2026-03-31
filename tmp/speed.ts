import { expertFeedbackPipeline } from '../src/lib/expert-pipeline';
import { masterAnalyze } from '../src/lib/analyze';
import { detectCategory } from '../src/lib/matcher-core';
import { getEnhancedNlp } from '../src/lib/nlp-dictionary';
import prismadb from '../src/lib/prismadb';

async function measureP(name: string, p: Promise<any>) {
    const start = Date.now();
    const res = await p;
    console.log(`[${name}] took ${Date.now() - start}ms`);
    return res;
}

async function run() {
    const text = 'מפלצת גיימינג מטורפת!! ASUS ROG Strix SCAR 16 תיאור: חברים המחשב הזה מריץ הכל על אולטרה בלי למצמץ. RTX 4080 שנותן עבודה, מסך Nebula HDR חומרה: כרטיס מסך NVIDIA RTX 4080 מעבד Intel i9 מסך 240Hz קירור מובנה מחיר: 10,500 שח';
    const category = 'LAPTOPS';

    console.log('--- STARTING DIAGNOSTIC ---');

    console.log('1. getEnhancedNlp()');
    await measureP('getEnhancedNlp', getEnhancedNlp());

    console.log('2. detectCategory()');
    await measureP('detectCategory', detectCategory(text));

    console.log('3. masterAnalyze() direct call');
    await measureP('masterAnalyze', masterAnalyze(text, category));

    console.log('4. expertFeedbackPipeline() full call');
    await measureP('expertFeedbackPipeline', expertFeedbackPipeline(text, category));

    console.log('--- DIAGNOSTIC COMPLETE ---');
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
