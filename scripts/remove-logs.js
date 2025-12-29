// Script to remove all console.log statements from the codebase
// Run with: node scripts/remove-logs.js

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function removeConsoleLogs(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove console.log statements (handles multi-line)
    content = content.replace(/console\.log\([^)]*\);?\n?/g, '');

    // Remove standalone console.log lines with proper indentation cleanup
    content = content.replace(/^[ \t]*console\.log\([\s\S]*?\);?\n/gm, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Cleaned: ${filePath}`);
        return true;
    }
    return false;
}

function processDirectory(dir) {
    let filesProcessed = 0;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            filesProcessed += processDirectory(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            if (removeConsoleLogs(filePath)) {
                filesProcessed++;
            }
        }
    });

    return filesProcessed;
}

console.log('🧹 Removing console.log statements...\n');
const count = processDirectory(srcDir);
console.log(`\n✨ Done! Removed console.log from ${count} file(s).`);
