// Quick test for listing AI analysis
// Run with: node --loader ts-node/esm test-ai.mjs
// OR convert below to use compiled JS

import { analyzeListingText } from './src/lib/listing-ai.js';

const text = `מחשב נייד גיימינג Lenovo LOQ AI-Powered Gaming PC 15.6" FHD 144Hz i7-14700HX/32GB/1TB NVME/NVIDIA GeForce RTX 5060 8GB/WIN 11 HOME/3Y 83JE00HUIV
Lenovo LOQ 15IRX10
מחשב ה-Lenovo LOQ 15IRX10 מהדור החדש מציב רף ביצועים גבוה במיוחד עבור גיימרים ויוצרי תוכן מקצועיים.`;

const result = analyzeListingText(text);
console.log('=== AI ANALYSIS RESULT ===');
console.log('Category:', result.category);
console.log('SubCategory:', result.subCategory);
console.log('Model:', result.model);
console.log('Make:', result.make);
console.log('\nAttributes:');
result.attributes.forEach(a => console.log(`  ${a.key}: ${a.value}${a.unit ? ' ' + a.unit : ''}`));
console.log('\nMissing:', result.missingFields);
