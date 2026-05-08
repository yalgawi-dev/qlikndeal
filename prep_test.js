// Mocking for testing
const fs = require('fs');
const path = require('path');
const analyzeModPath = path.join(__dirname, 'src', 'lib', 'analyze.ts');
let analyzeCode = fs.readFileSync(analyzeModPath, 'utf8');

// Replace the imports and cache logic to run locally
analyzeCode = analyzeCode.replace(/import .*?from "@\/lib\/prismadb";/g, 'const prismadb = require("./prismadb");');
analyzeCode = analyzeCode.replace(/import \{ dbCache \} from "\.\/db-cache";/g, `
const dbCache = {
    getOrFetch: async (key, fn) => fn()
};
`);
analyzeCode = analyzeCode.replace(/import .*?from "\.\/parsing\/contextAwareParser";/g, `
const ContextAwareParser = { parse: async () => [] };
`);

fs.writeFileSync(path.join(__dirname, 'tmp_analyze_test.ts'), analyzeCode);
