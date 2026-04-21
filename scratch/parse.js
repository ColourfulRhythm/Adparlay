const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const Parser = acorn.Parser.extend(jsx());

const code = fs.readFileSync('src/pages/LandingPageBuilder.tsx', 'utf8');

try {
  // It's TSX so acorn might fail on TS syntax. 
  // Let's just use typescript compiler api to parse it.
} catch(e) {}
