const fs = require('fs');
const content = fs.readFileSync('src/pages/LandingPageBuilder.tsx', 'utf8');

const lines = content.split('\n');
let divCount = 0;
let stack = [];

for (let i = 1168; i < 1968; i++) {
  const line = lines[i];
  // Simplistic check, just counting <div and </div
  const openDivs = (line.match(/<div(\s|>)/g) || []).length;
  const closeDivs = (line.match(/<\/div>/g) || []).length;
  
  if (openDivs !== closeDivs) {
    divCount += openDivs - closeDivs;
    console.log(`Line ${i + 1}: ${line.trim()} (Net: ${openDivs - closeDivs}, Total: ${divCount})`);
  }
}
console.log(`Final total unclosed divs: ${divCount}`);
