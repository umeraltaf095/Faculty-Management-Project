const fs = require('fs');
const path = require('path');
const dirJs = './js';
const jsFiles = fs.readdirSync(dirJs).filter(f => f.endsWith('.js') && f !== 'toast.js');

for (const file of jsFiles) {
    const filePath = path.join(dirJs, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove console.error with alert combo and replace with showToast error
    content = content.replace(/console\.error\([^)]+\);\s*alert\(([^)]+)\);/g, 'showToast($1, "error");');
    
    // Convert remaining alerts
    content = content.replace(/alert\(([^)]+)\);/g, (match, p1) => {
        const lower = p1.toLowerCase();
        if (lower.includes('success')) {
            return 'showToast(' + p1 + ', "success");';
        } else if (lower.includes('error') || lower.includes('fail') || lower.includes('invalid') || lower.includes('please') || lower.includes('wrong') || lower.includes('no ')) {
            return 'showToast(' + p1 + ', "error");';
        }
        return 'showToast(' + p1 + ', "info");';
    });

    // Replace console.error alone if any
    content = content.replace(/console\.error\(([^)]+)\);/g, 'showToast($1, "error");');

    // For login and other redirects right after success
    content = content.replace(/showToast\(([^,]+),\s*"success"\);\s*window\.location\.href\s*=\s*([^;]+);/g, 'showToast($1, "success");\n      setTimeout(() => { window.location.href = $2; }, 1500);');

    fs.writeFileSync(filePath, content, 'utf-8');
}

const dirPages = './pages';
const htmlFiles = fs.readdirSync(dirPages).filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
    const filePath = path.join(dirPages, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes('toast.js')) {
        content = content.replace(/<\/body>/, '  <script src="../js/toast.js"></script>\n  </body>');
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}

const indexFile = './index.html';
let indexContent = fs.readFileSync(indexFile, 'utf-8');
if (!indexContent.includes('toast.js')) {
    indexContent = indexContent.replace(/<\/body>/, '  <script src="js/toast.js"></script>\n</body>');
    fs.writeFileSync(indexFile, indexContent, 'utf-8');
}

console.log('Replacements completed.');
