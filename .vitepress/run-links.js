#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv;

const readArgs = function (args) {
    const result = {
        path: args[2],
    }
    return result;
}
const input = readArgs(args);

const modulePath = path.resolve(input["path"], 'module.js');
const bookModule = require(modulePath);
// 定义要读取的文件路径模式
const filePattern = path.join(input["path"], ... bookModule.pattern);
const order = bookModule.order;

// 读取文件内容并生成链接
for (let i = order["begin"]; i <= order["end"]; i++) {
    const filePath = filePattern.replace('%02d', i.toString().padStart(2, '0'));

    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`读取文件 ${filePath} 失败:`, err);
            return;
        }

        // 生成链接
        let links = '---\n';

        if (i == order["begin"]) {
            links += `prev:\n  text: 'base'\n  link: '${bookModule.prelink}'\n`
        } else if (i > order["begin"]) {
            const prevLink = bookModule.generateLink(i - 1, 'prev');
            links += `prev:\n  text: '${prevLink.text}'\n  link: '${prevLink.link}'\n`;
        }
        if (i < order["end"]) {
            const nextLink = bookModule.generateLink(i + 1, 'next');
            links += `next:\n  text: '${nextLink.text}'\n  link: '${nextLink.link}'\n`;
        }
        links += '---\n';

        // 将链接添加到文件内容的开头
        const modifiedContent = `${links}\n${data}`;

        // 写回文件
        fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
            if (err) {
                console.error(`写入文件 ${filePath} 失败:`, err);
            } else {
                console.log(`文件 ${filePath} 链接生成成功`);
            }
        });
    });
}