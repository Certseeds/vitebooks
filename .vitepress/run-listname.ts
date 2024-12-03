#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const findDirWithCNAME = (startDir) => {
    for (let dir = startDir; dir !== path.parse(dir).root;) {
        if (fs.existsSync(path.join(dir, 'CNAME'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    return null;
}
const isChinese = (str) => /[\u4e00-\u9fa5]/.test(str);
const processDirectory = async (dir) => {
    console.log(dir);
    const namesPath = path.join(dir, 'names.txt');
    if (fs.existsSync(namesPath)) {
        const namesContent = await fsp.readFile(namesPath, 'utf-8');
        const processed = processTxtContent(namesContent, '### 替换列表');
        await fsp.appendFile(path.join(dir, 'meta.md'), processed, 'utf-8');
    }
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory() && isChinese(entry.name)) {
            await processDirectory(path.join(dir, entry.name));
        }
    }
}
const processTxtContent = (content: string, head: string) => {
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startDir = path.resolve(__dirname);
const targetDir = findDirWithCNAME(startDir);
if (targetDir) {
    await processDirectory(targetDir);
}

const primarchNames = path.join(targetDir, 'warhammer40k', 'names.txt');
const primarchNamesContent = await fsp.readFile(primarchNames, 'utf-8');
const primarchNamesProcessed = processTxtContent(primarchNamesContent, `## 重要人物姓名替换列表`);
await fsp.appendFile(path.join(targetDir, 'warhammer40k', 'primarchs.md'), primarchNamesProcessed, 'utf-8');

const commonNames = path.join(targetDir, 'warhammer40k', 'legion.txt');
const commonNamesContent = await fsp.readFile(commonNames, 'utf-8');
const commonNamesProcessed = processTxtContent(commonNamesContent, `## 军团常见词汇替换列表`);
await fsp.appendFile(path.join(targetDir, 'warhammer40k', 'primarchs.md'), commonNamesProcessed, 'utf-8');

const MechanicumNames = path.join(targetDir, 'warhammer40k', 'mechanicum.txt');
const MechanicumNamesContent = await fsp.readFile(MechanicumNames, 'utf-8');
const MechanicumNamesProcessed = processTxtContent(MechanicumNamesContent, `## 机械神教常见词汇替换列表`);
await fsp.appendFile(path.join(targetDir, 'warhammer40k', 'primarchs.md'), MechanicumNamesProcessed, 'utf-8');

