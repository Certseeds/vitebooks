#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.mts';


const findDirWithCNAME: (string) => (string | null) = (startDir: string) => {
    for (let dir = startDir; dir !== path.parse(dir).root;) {
        if (fs.existsSync(path.join(dir, 'CNAME'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    return null;
}

const processSideBarElements = async (config: any, dir: string) => {
    const sidear = config.themeConfig.sidebar;
    const HHs = sidear.filter(x => x.text === '荷鲁斯之乱')[0];
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const entriesSet = new Set(entries.map(x => x.name))
    const bookNameMap__ = entries
        .map(x => x.name)
        .filter(x => x.endsWith('.epub'))
        .map(x => {
            return [x.split('-')[0], x] as [string, string];
        });
    const bookNameMap = new Map(bookNameMap__);
    const names = HHs.items
        .map(x => x.text)
        .filter(x => {
            return entriesSet.has(x) &&
                bookNameMap.has(x) &&
                fs.existsSync(path.join(dir, x, 'meta.toml'))
        })
        .map(x => bookNameMap.get(x));
    return names;
}

const processContent = (names: string[]) => {
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
const targetDir = findDirWithCNAME(startDir) ?? "./../";
const bookNames = await processSideBarElements(config, targetDir);
console.log(bookNames);
const epubPage = path.join(targetDir, 'warhammer40k', 'epub.md');
const epubContent = processContent(bookNames);
console.log(epubContent);

await fsp.appendFile(epubPage, epubContent, 'utf-8');
