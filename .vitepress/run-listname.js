#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

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
    const namesPath = path.join(dir, 'names.txt');
    if (fs.existsSync(namesPath)) {
        const namesContent = fs.readFileSync(namesPath, 'utf-8');
        const processed = processTxtContent(namesContent, '### 替换列表');
        fs.appendFileSync(path.join(dir, 'meta.md'), processed, 'utf-8');
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory() && isChinese(entry.name)) {
            processDirectory(path.join(dir, entry.name));
        }
    }
}
const processTxtContent = function (content, head) {
    const lines = content.split('\n');
    const writeLines = lines
        .map(x => x.trim())
        .filter(x => x.length > 0)
        .map(line => {
            const names = line.split(' ');
            return `|${names[0]}|${names[1]}|`;
        })
    const results = ["", `${head}`, "", "|原词|替换词|", "|:-:|:-:|"]
        .concat(writeLines)
        .concat([""])
        .join('\n');
    return results;
}

const startDir = (path.resolve(__dirname));
const targetDir = findDirWithCNAME(startDir);
if (targetDir) {
    processDirectory(targetDir);
}

const primarchNames = path.join(targetDir, 'warhammer40k', 'names.txt');
const primarchNamesContent = fs.readFileSync(primarchNames, 'utf-8');
const primarchNamesProcessed = processTxtContent(primarchNamesContent, `## 原体姓名替换列表`);
fs.appendFileSync(path.join(targetDir, 'warhammer40k', 'primarchs.md'), primarchNamesProcessed, 'utf-8');

const commonNames = path.join(targetDir, 'warhammer40k', 'legion.txt');
const commonNamesContent = fs.readFileSync(commonNames, 'utf-8');
const commonNamesProcessed = processTxtContent(commonNamesContent, `## 军团常见词汇替换列表`);
fs.appendFileSync(path.join(targetDir, 'warhammer40k', 'primarchs.md'), commonNamesProcessed, 'utf-8');

const MechanicumNames = path.join(targetDir, 'warhammer40k', 'mechanicum.txt');
const MechanicumNamesContent = fs.readFileSync(MechanicumNames, 'utf-8');
const MechanicumNamesProcessed = processTxtContent(MechanicumNamesContent, `## 机械神教常见词汇替换列表`);
fs.appendFileSync(path.join(targetDir, 'warhammer40k', 'primarchs.md'), MechanicumNamesProcessed, 'utf-8');

