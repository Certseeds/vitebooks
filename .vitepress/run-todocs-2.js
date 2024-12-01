#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv;

const readArgs = function (args) {
    const result = {
        path: args[2],
    }
    return result;
}
const input = readArgs(args);

const modulePath = path.resolve(input["path"], 'module.js');
const configPath = pathToFileURL(modulePath).href;
const bookModule = await import(configPath);
// 定义要读取的文件路径模式
const order = bookModule.order;

const data = fs.readFileSync(path.resolve(bookModule.resource), 'utf8');

// 将文件内容按行分隔存入数组
const lines = data.split('\r\n');

const chapterFunction = bookModule.IsChapterBegin;

const contentMap = order.map(num => Array.from({ length: num }, () => []));
const createIterator = function* (order) {
    for (let i in order) {
        for (let j = 0; j < order[i]; j++) {
            yield { section: Number(i), step: j };
        }
    }
}
let iterator1 = createIterator(order); // pay attention, clear the empty line before the first chapter
let chapterInfo;
for (let line of lines) {
    let trimmedLine = line.trim();
    if (chapterFunction(trimmedLine)) {
        chapterInfo = iterator1.next().value;
        console.log(chapterInfo);
        contentMap[chapterInfo.section][chapterInfo.step].push(bookModule.head(chapterInfo.section + 1, chapterInfo.step + 1));
    } else {
        contentMap[chapterInfo.section][chapterInfo.step].push(line);
    }
}
for (let folder of bookModule.replaceDirs) {
    fs.mkdirSync(path.resolve(folder), { recursive: true });
}

for (let i in order) {
    const numberi = Number(i);
    for (let j = 0; j < order[i]; j++) {
        const filePath = path.resolve(bookModule.pattern(numberi + 1, j + 1));
        const content = contentMap[numberi][j].join('\n');
        fs.writeFileSync(filePath, content, 'utf8');
    }
}
