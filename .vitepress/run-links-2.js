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
const filePattern = bookModule.pattern;
const order = bookModule.order;

// 遍历order, 使用js中的for...of 
for (let i in order) {
    const numberI = Number(i);
    for (let j = 1; j <= order[i]; j++) {
        let links = '---\n';
        if (j === 1) {
            if (numberI === 0) {
                links += `prev:\n  text: 'base'\n  link: '${bookModule.prelink}'\n`
            } else {
                const prevLink = bookModule.generateLink(numberI, order[i - 1]);
                links += `prev:\n  text: '${prevLink.text}'\n  link: '${prevLink.link}'\n`;
            }
        } else {
            const prevLink = bookModule.generateLink(numberI + 1, j - 1);
            links += `prev:\n  text: '${prevLink.text}'\n  link: '${prevLink.link}'\n`;
        }

        if (j === order[i]) {
            if (numberI === order.length - 1) {
                links += `next:\n  text: 'base'\n  link: '${bookModule.prelink}'\n`
            } else {
                const nextLink = bookModule.generateLink(numberI + 2, 1);
                links += `next:\n  text: '${nextLink.text}'\n  link: '${nextLink.link}'\n`;
            }
        } else {
            const nextLink = bookModule.generateLink(numberI + 1, j + 1);
            links += `next:\n  text: '${nextLink.text}'\n  link: '${nextLink.link}'\n`;
        }
        links += '---\n';

        const filePath = path.resolve(filePattern(Number(i) + 1, j));
        console.log(filePath);
        const data = fs.readFileSync(filePath, 'utf8');
        const modifiedContent = `${links}\n${data}`;
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
    }
}
