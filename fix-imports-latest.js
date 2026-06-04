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

const icons = [
    'diamondIcon',
    'homeIcon',
    'marketIcon',
    'messageIcon',
    'pageIcon',
    'profileIcon',
    'settingsIcon',
    'templatesIcon',
    'trashIcon'
];

allFiles.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf8');
        let newContent = content;
        
        // fix the imports where it starts with '../icons/CamelCase'
        icons.forEach(iconName => {
            const camelCaseIcon = iconName.charAt(0).toUpperCase() + iconName.slice(1);
            // newContent = newContent.replace(`../icons/${camelCaseIcon}`, `../icons/${iconName}`);
            const regex = new RegExp(`['"]([^'"]*)\\/icons\\/${camelCaseIcon}['"]`, 'g');
            newContent = newContent.replace(regex, `'$1/icons/${iconName}'`);
        });

        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Fixed imports in: ${path.basename(file)}`);
        }
    }
});