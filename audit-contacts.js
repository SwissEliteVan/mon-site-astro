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
  wrongPhone: [],
  wrongEmail: []
};

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    // Check for phone numbers that look like a phone but are NOT 078 823 89 50 or +41788238950
    const phoneMatches = line.match(/(?:\+41|0)[1-9][0-9]{1,2}[ \-\.]?[0-9]{3}[ \-\.]?[0-9]{2}[ \-\.]?[0-9]{2}/g);
    if (phoneMatches) {
       for (const match of phoneMatches) {
         const normalized = match.replace(/[\s\-\.]/g, '');
         if (normalized !== '0788238950' && normalized !== '+41788238950') {
           issues.wrongPhone.push(`${file}:${lineNum}: Found phone ${match}`);
         }
       }
    }

    const emailMatches = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) {
       for (const match of emailMatches) {
         if (match !== 'hello@clicom.ch') {
           issues.wrongEmail.push(`${file}:${lineNum}: Found email ${match}`);
         }
       }
    }
  });
}

console.log("=== WRONG PHONES ===");
console.log(issues.wrongPhone.join('\n'));
console.log("\n=== WRONG EMAILS ===");
console.log(issues.wrongEmail.join('\n'));
