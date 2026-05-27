const fs = require("fs");
const logFile = "C:\\Users\\yalga\\.gemini\\antigravity\\brain\\5ffa2956-e332-4045-9688-d398aa1b7081\\.system_generated\\tasks\\task-4396.log";
if (fs.existsSync(logFile)) {
    const lines = fs.readFileSync(logFile, "utf8").split("\n");
    const searchLines = lines.filter(l => l.includes("/api/marketplace/catalog-search"));
    console.log("Catalog search requests in log:");
    searchLines.forEach(l => console.log(l));
} else {
    console.log("Log file not found.");
}
