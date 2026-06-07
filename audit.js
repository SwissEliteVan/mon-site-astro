import fs from 'fs';
import path from 'path';

function findInDir(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findInDir(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const astroFiles = findInDir('./src', /\.astro$/);
const mdFiles = findInDir('./src', /\.md$/);
const allFiles = [...astroFiles, ...mdFiles];

const issues = {
  emptyLinks: [],
  wrongContact: [],
  rgpd: [],
  lorem: []
};

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    if (line.includes('href="#"') || line.includes("href='#'") || line.match(/href=["'](?!#contact|#services|#demo|#main-content|\/)[^"']*["']/)) {
       // Wait, regex might be noisy. Let's just look for exact empty links.
       if (line.includes('href="#"') || line.includes("href='#'")) {
         issues.emptyLinks.push(`${file}:${lineNum}: ${line.trim()}`);
       }
    }
    if (line.includes('RGPD')) {
      issues.rgpd.push(`${file}:${lineNum}: ${line.trim()}`);
    }
    if (line.toLowerCase().includes('lorem ipsum')) {
      issues.lorem.push(`${file}:${lineNum}: ${line.trim()}`);
    }
  });
}

console.log("=== EMPTY LINKS ===");
console.log(issues.emptyLinks.join('\n'));
console.log("\n=== RGPD REFERENCES ===");
console.log(issues.rgpd.join('\n'));
console.log("\n=== LOREM IPSUM ===");
console.log(issues.lorem.join('\n'));
