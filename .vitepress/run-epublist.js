#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');


const findDirWithCNAME = function (startDir) {
    for (let dir = startDir; dir !== path.parse(dir).root;) {
        if (fs.existsSync(path.join(dir, 'CNAME'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    return null;
}
const isChinese = (str) => /[\u4e00-\u9fa5]/.test(str);
const processDirectory = function (dir) {
    console.log(dir);
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let results = [];
    for (const entry of entries) {
        console.log(entry.name);
        if (entry.isDirectory() && isChinese(entry.name)) {
            const namesPath = path.join(dir, entry.name, 'meta.toml');
            if (fs.existsSync(namesPath)) {
                results.push(entry.name);
            }
        }
    }
    return results;
}
const processContent = function (names) {
    const head = `
---
prev:
  text: 'dependencies'
  link: '/warhammer40k/dependencies'
---`;
    const lines =
        head.split("\n")
            .filter(x => x.length > 0)
            .concat(["", "# epub列表"])
            .concat([""])
            .concat(names.map(x => `+ [${x}](/epub/${x}.epub)`))
            .concat([""]);
    return lines.join('\n');
}

const startDir = (path.resolve(__dirname));
const targetDir = findDirWithCNAME(startDir);
const bookNames = processDirectory(targetDir);
console.log(bookNames);
const epubPage = path.join(targetDir, 'warhammer40k', 'epub.md');
const epubContent = processContent(bookNames);
fs.appendFileSync(epubPage, epubContent, 'utf-8');

