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
        if (entry.isFile && entry.name.endsWith('epub')) {
            const [book_name, run_number, build_day] = entry.name.split('-'); // 解构字符串
            const namesPath = path.join(dir, book_name, 'meta.toml');
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
            .concat(["", "# epub列表"])
            .concat([""])
            .concat(names.map(x => {
                const [name, run_number, build_day] = x.split('-'); // 解构字符串
                `+ [${name}](/epub/${x}.epub)`
            }))
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

