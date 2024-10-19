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
const order = bookModule.order;

const data = fs.readFileSync(path.resolve(bookModule.resource), 'utf8');

// 将文件内容按行分隔存入数组
const lines = data.split('\r\n');

const chapterFunction = bookModule.IsChapterBegin;

const contentMap = Array.from({ length: order["end"] - order["begin"] + 1 }, () => []);

const createIterator = function* (order) {
    for (let i = order["begin"]; i <= order["end"]; i++) {
        yield i;
    }
}
let iterator1 = createIterator(order); // pay attention, clear the empty line before the first chapter
let chapterInfo;
for (let line of lines) {
    let trimmedLine = line.trim();
    if (chapterFunction(trimmedLine)) {
        chapterInfo = iterator1.next().value;
        console.log(trimmedLine);
        console.log(chapterInfo);
        contentMap[chapterInfo - 1].push(bookModule.head(chapterInfo));
    } else {
        contentMap[chapterInfo - 1].push(trimmedLine);
    }
}

for (let folder of bookModule.replaceDirs) {
    fs.mkdirSync(path.resolve(folder), { recursive: true });
}
for (let i = order["begin"]; i <= order["end"]; i++) {
    const filePath = path.resolve(input["path"], ...bookModule.generatePattern(i));
    const array = contentMap[i - 1];
    array[1] = `## ${array[1]}`;
    array[3] = `## ${array[3]}`;
    array[5] = `## ${array[5]}`;
    const content = array.join('\n');
    fs.writeFileSync(filePath, content, 'utf8');
}