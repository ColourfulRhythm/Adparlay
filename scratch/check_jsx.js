const fs = require('fs');
const content = fs.readFileSync('src/pages/LandingPageBuilder.tsx', 'utf8');
const lines = content.split('\n');
let formStart = 1168; // line 1169
let formEnd = 1967; // line 1968

let stack = [];
for (let i = formStart; i <= formEnd; i++) {
    let line = lines[i];
    // Very basic tag parser
    let regex = /<\/?([a-zA-Z0-9_-]+)(?=[>\s/])/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        let tag = match[1];
        let isClosing = match[0].startsWith('</');
        
        // Skip self-closing tags on the same line. A bit hacky: check if the tag ends with />
        let tagEndIndex = line.indexOf('>', match.index);
        let isSelfClosing = line.substring(match.index, tagEndIndex !== -1 ? tagEndIndex + 1 : line.length).endsWith('/>');
        if (isSelfClosing && !isClosing) continue;
        
        // Skip common self-closing html tags
        if (['input', 'img', 'br', 'hr', 'path', 'svg', 'motion.button'].includes(tag) && !isClosing) {
            // Need to handle SVG properly, but let's ignore motion.button self closing etc
            // Actually motion.button is not always self closing. Let's just track div and form.
        }
        
        if (tag === 'div') {
            if (isClosing) {
                if (stack.length > 0 && stack[stack.length - 1].tag === 'div') {
                    stack.pop();
                } else {
                    console.log(`Unmatched </div> at line ${i + 1}`);
                }
            } else {
                if (!isSelfClosing) {
                    stack.push({tag: 'div', line: i + 1});
                }
            }
        }
    }
}
console.log("Unclosed divs:");
stack.forEach(item => console.log(`Line ${item.line}`));
