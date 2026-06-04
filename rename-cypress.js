const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'project', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const allFiles = walk(srcDir);

// 1. Rename files
allFiles.forEach(file => {
    const filename = path.basename(file);
    if (filename.toLowerCase().includes('cypress') && file.endsWith('.tsx')) {
        let newName = filename.replace(/cypress/i, '');
        // lowercase the first letter
        newName = newName.charAt(0).toLowerCase() + newName.slice(1);
        const newPath = path.join(path.dirname(file), newName);
        fs.renameSync(file, newPath);
        console.log(`Renamed: ${filename} to ${newName}`);
    }
});

// Refresh file list after rename
const newAllFiles = walk(srcDir);

// 2. Replace contents in all files
newAllFiles.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content.replace(/cypress/gi, '');
        
        // Let's specifically handle components e.g. `<CypressProfileIcon />` -> `<ProfileIcon />`
        // the generic replace above will change `CypressProfileIcon` to `ProfileIcon` (case insensitive but wait replace(/cypress/gi, '') removes the prefix entirely!)
        // However, Cypress is capitalized in component names. 
        // /Cypress/g -> ''
        // /cypress/g -> ''
        // This is safe because we just want to remove the branding prefix!

        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated content in: ${path.basename(file)}`);
        }
    }
});
