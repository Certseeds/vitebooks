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
const modulePath = path.resolve(input["path"], 'module.js');
const configPath = pathToFileURL(modulePath).href;
const bookModule = await import(configPath);

const todoFiles = bookModule.replaceDirs.reduce((acc, dir) => {
    const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.md'))
        .map(file => path.resolve(dir, file));
    return acc.concat(files);
}, []).concat(bookModule.repalceFiles);

// 定义要读取的文件路径模式

todoFiles.forEach(filePath => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`读取文件 ${filePath} 失败:`, err);
            return;
        }

        // 正则表达式匹配括号内的内容
        const regex = /\(([^)]+)\)/g;

        let match;
        let count = 1;
        let references = [];
        let modifiedContent = data;

        // 依次读取括号内的内容并标号
        while ((match = regex.exec(data)) !== null) {
            const originalText = match[0];
            const innerText = match[1];
            const reference = `[^${count}]`;

            // 替换括号内的内容为 [^${标号}]
            modifiedContent = modifiedContent.replace(originalText, reference);

            // 将标注内容添加到 references 数组中
            references.push(`[^${count}]: ${innerText}\n\n`);
            count++;
        }

        // 将标注内容添加到全文最后
        modifiedContent += '\n' + references.join('');


        // 写回文件
        fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
            if (err) {
                console.error(`写入文件 ${filePath} 失败:`, err);
            } else {
                console.log(`文件 ${filePath} 替换成功`);
            }
        });
    });
});