const fs = require('fs');
const path = require('path');

const fileRegex = /['"]([^'"]*\/icons\/)([A-Z][a-zA-Z]+)Icon['"]/g;

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

allFiles.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;
        
        newContent = newContent.replace(fileRegex, (match, prefix, iconName) => {
            // iconName is something like 'Profile'
            const newIconName = iconName.charAt(0).toLowerCase() + iconName.slice(1);
            return `'${prefix}${newIconName}Icon'`;
        });

        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Fixed imports in: ${path.basename(file)}`);
        }
    }
});