const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        getFiles(filePath, fileList);
      }
    } else {
      fileList.push({ path: filePath, mtime: stat.mtime });
    }
  }
  return fileList;
}

console.log("Scanning files for recent modifications...");
const allFiles = getFiles(path.join(__dirname, '..'));
allFiles.sort((a, b) => b.mtime - a.mtime);

console.log("\nTop 15 most recently modified files:");
allFiles.slice(0, 15).forEach(f => {
  console.log(`- ${f.path} (Modified: ${f.mtime.toLocaleString()})`);
});
