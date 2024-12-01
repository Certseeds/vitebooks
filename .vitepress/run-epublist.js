#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.mjs';


const findDirWithCNAME = function (startDir) {
    for (let dir = startDir; dir !== path.parse(dir).root;) {
        if (fs.existsSync(path.join(dir, 'CNAME'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    return null;
}

const processSideBarElements = (config, dir) => {
    const sidear = config.themeConfig.sidebar;
    const HHs = sidear.filter(x => x.text === '荷鲁斯之乱')[0];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const entriesSet = new Set(
        entries.map(x => x.name)
    )
    console.log(entriesSet)
    const names = HHs.items
        .map(x => x.text)
        .filter(x => {
            return entriesSet.has(x) &&
            fs.existsSync(path.join(dir, x, 'meta.toml'))
        });
    ;
    return names;
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
            .concat(names.map(x => {
                const [name, run_number, build_day] = x.split('-'); // 解构字符串
                return `+ [${name}](/epub/${x})`;
            }))
            .concat([""]);
    return lines.join('\n');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startDir = path.resolve(__dirname);
const targetDir = findDirWithCNAME(startDir);
const bookNames2 = processSideBarElements(config, targetDir);
console.log(bookNames2);
const epubPage = path.join(targetDir, 'warhammer40k', 'epub.md');
const epubContent = processContent(bookNames2);
console.log(epubContent);
fs.appendFileSync(epubPage, epubContent, 'utf-8');
