#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv;

const readArgs = function (args) {
    const result = {
        path: args[2]
    }
    return result;
}
const input = readArgs(args);
const source = path.resolve(input["path"], 'src.en.md');
const mapfile = path.resolve(input["path"], 'map.json');

// 读取source文件内容, 并将其trim后按行分割
const sourceContent = fs.readFileSync(source, 'utf8');
const trimmedLines = sourceContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

console.log(trimmedLines.length)

// 读取mapfile, 并构造en-cn表
const mapContent = fs.readFileSync(mapfile, 'utf8');
const enCnList = JSON.parse(mapContent);
const enCnMap = new Map(enCnList.map(item => [item.en, item.cn]));
// 读取mapfile, 并构造en-cn表

const trans = [];

const level1 = async () => {
    for (let trimmedLine of trimmedLines) {
        for (let [en, cn] of enCnMap) {
            trimmedLine = trimmedLine.replace(en, cn);
        }
        await level2(trimmedLine);
    }
}

const level2 = async (line) => {
    const postObject = {
        "model": "qwen2.5:14b",
        "prompt": `hey, 请阅读下面用三个 at 符号括住的一段话, 这摘录自一篇战锤30k荷鲁斯叛乱系列小说中. 已经将部分英文人名替换为中文, 希望你将其整体翻译为中文, 不要加入任何推理过程, 并以json格式返回'。@@@${line}@@@`,
        "format": {
            "type": "object",
            "properties": {
                "translate": {
                    "type": "string"
                }
            },
            "required": ["names"]
        },
        "stream": false,
    };
    try {
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: "POST",
            body: JSON.stringify(postObject),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        const respnames = JSON.parse(data['response'])["translate"];
        console.log(line);
        console.log(respnames);
        const translateSentences = respnames ?? "ERROR";

        trans.push(line);
        trans.push(translateSentences);
    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

const level0 = async () => {
    await level1();
    const output = path.resolve(input["path"], 'src.cn.md');
    fs.writeFileSync(output, trans.join('\n\n'));
}

(async () => {
    await level0();
})();
