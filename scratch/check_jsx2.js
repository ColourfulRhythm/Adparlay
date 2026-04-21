const fs = require('fs');
const content = fs.readFileSync('src/pages/LandingPageBuilder.tsx', 'utf8');

// Strip out self-closing tags first
let stripped = content.replace(/<[a-zA-Z0-9_-]+[^>]*\/>/g, '');

const lines = stripped.split('\n');
let formStart = 1168; // line 1169
let formEnd = 1967; // line 1968

let stack = [];
for (let i = formStart; i <= formEnd; i++) {
    let line = lines[i];
    let regex = /<\/?([a-zA-Z0-9_-]+)(?=[>\s/])/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        let tag = match[1];
        let isClosing = match[0].startsWith('</');
        
        // Skip common self-closing html tags
        if (['input', 'img', 'br', 'hr', 'path', 'svg', 'motion.button', 'motion.div', 'iframe'].includes(tag) && !isClosing) {
            continue;
        }
        
        if (tag === 'div' || tag === 'form') {
            if (isClosing) {
                if (stack.length > 0 && stack[stack.length - 1].tag === tag) {
                    stack.pop();
                } else {
                    console.log(`Mismatch at line ${i + 1}: expected ${stack.length > 0 ? stack[stack.length-1].tag : 'none'}, found ${tag}`);
                    if (tag === 'form' && stack.length > 0 && stack[stack.length - 1].tag === 'div') {
                         console.log("Found the extra div! Unclosed div opened at line " + stack[stack.length - 1].line);
                    }
                }
            } else {
                stack.push({tag, line: i + 1});
            }
        }
    }
}
console.log("Remaining unclosed tags:");
stack.forEach(item => console.log(`${item.tag} at Line ${item.line}`));
