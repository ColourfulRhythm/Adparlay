const ts = require('typescript');
const fs = require('fs');
const fileName = 'src/pages/LandingPageBuilder.tsx';
const sourceCode = fs.readFileSync(fileName, 'utf8');
const sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);

function visit(node) {
    if (ts.isJsxElement(node)) {
        if (node.openingElement.tagName.getText() !== node.closingElement.tagName.getText()) {
             // This doesn't strictly work because TS Parser will just produce an error node.
        }
    }
    ts.forEachChild(node, visit);
}
// Actually, TS compiler error tells us exactly where the problem STARTS:
// JSX element 'form' has no corresponding closing tag.
