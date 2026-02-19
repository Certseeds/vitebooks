#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sidebar } from './../src/data/sidebar.ts';
import { domainName } from './domain.js';

const findDirWithCNAME: (string) => (string | null) = (startDir: string) => {
    for (let dir = startDir; dir !== path.parse(dir).root;) {
        if (fs.existsSync(path.join(dir, 'CNAME'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    return null;
}

const processSideBarElements = async (sidebarItems: any[], dir: string) => {
    const HHs = sidebarItems.find((x: any) => x.text === '荷鲁斯之乱');
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
    const lines = "".split("\n")
        .filter(x => x.length > 0)
        .concat(["", "# epub列表"])
        .concat([""])
        .concat(names.map(x => {
            const [name] = x.split('-');
            return `+ [${name}](${domainName()}/epub/${x})`;
        }))
        .concat([""]);
    return lines.join('\n');
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startDir = path.resolve(__dirname);
const targetDir = findDirWithCNAME(startDir) ?? "./../";
const bookNames = await processSideBarElements(sidebar, targetDir);
console.log(bookNames);
const epubPage = path.join(targetDir, 'warhammer40k', 'epub.md');
const epubContent = processContent(bookNames);
console.log(epubContent);

await fsp.appendFile(epubPage, epubContent, 'utf-8');
const writeIndex = async (sidebarItems: any[]) => {
    const HHs = sidebarItems.find((x: any) => x.text === '荷鲁斯之乱');
    const line1 = "|书名|链接|";
    const line2 = "|---|---|";
    const lines = HHs.items
        .filter(x => x.link.endsWith('/meta'))
        .map(x => {
            const name = x.text;
            const link = x.link;
            return `|${name}|[${name}-meta](${link})|`;
        })
    const strs = ["", line1, line2].concat(lines).join('\n');
    console.log(strs);
    return strs;
}
const indexPage = path.join(targetDir, 'index.md');
await fsp.appendFile(indexPage, await writeIndex(sidebar), 'utf-8');
