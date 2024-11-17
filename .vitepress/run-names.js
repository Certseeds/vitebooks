#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

const fs = require('fs');
const path = require('path');
const args = process.argv;

const readArgs = function (args) {
    const result = {
        path: args[2]
    }
    return result;
}
const input = readArgs(args);
const modulePath = path.resolve(input["path"], 'module.js');
const bookModule = require(modulePath);

const todoFiles = bookModule.replaceDirs.reduce((acc, dir) => {
    const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.md'))
        .map(file => path.resolve(dir, file));
    return acc.concat(files);
}, []).concat(bookModule.repalceFiles);
console.log(todoFiles)

// 定义要读取的文件路径模式

const names = [];

const level1 = async (todoFiles) => {
    for (let todoFile of todoFiles) {
        const data = fs.readFileSync(todoFile, 'utf8');
        const trimmedLines = data
            ?.split('\n')
            ?.map(line => line.trim())
            ?.filter(line => !line.startsWith('--'))
            ?.filter(line => !line.startsWith('#'))
            ?.filter(line => !line.startsWith('prev:'))
            ?.filter(line => !line.startsWith('next:'))
            ?.filter(line => !line.startsWith('text:'))
            ?.filter(line => !line.startsWith('link:'))
            ?.filter(line => !line.startsWith('\[\^'))
            ?.filter(x => x.length > 0) ?? [];
        for (let trimmedLine of trimmedLines) {
            await level2(trimmedLine);
        }
    }
}
const blackLists = ["你", "我", "他", "她", "它", "您", "大人", "指挥官", "队长", "大师", "总管", "兄弟", "姐妹", "原体", "连长", "团长", "军士", "中士", "智库", "军官",];
const level2 = async (line) => {
    const postObject = {
        "model": "qwen2.5:14b",
        "prompt": `hey, 请阅读下面用三个 at 符号括住的一段话, 这摘录自一篇战锤30k荷鲁斯叛乱系列小说中. 希望你在读完之后, 从中提取出人名, 只需要人名, 不需要'他','她','它','您'等第三人称代词, 不需要'兄弟', '姐妹'这样的亲属称谓, 不需要'大人', '指挥官', '队长', '大师', '总管'之类的职位称呼, 不需要A的B这样的连词(至少要将其拆分为A和B), 不需要车辆, 飞行器的名称(比如xx号), 并将其一行一行地输出, 不要输出代码, 也不需要输出额外的前缀、后缀. 如果没有人名则输出'WU-REN-MING'。@@@${line}@@@`,
        "stream": false
    };
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: "POST",
            body: JSON.stringify(postObject),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        const llm_names = data['response']
            ?.replace(/的/g, '\n')
            ?.split('\n')
            ?.map(x => x.trim())
            ?.filter(x => x.length > 0)
            ?.filter(x => line.includes(x))
            ?.filter(x => !blackLists.includes(x))
            ?.filter(x => !x.includes('WU-REN-MING')) ?? [];
        names.push(...llm_names);
        console.log(llm_names);
        if (llm_names.length == 0) {
            console.log(line);
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }
}

const level0 = async (names) => {
    // 所有 fetch 操作完成后执行的操作
    await level1(todoFiles);
    const output = path.resolve(input["path"], 'allnames.txt');
    names.sort();
    // unique names
    const uniqueNames = [...new Set(names)];
    console.log(output)
    fs.writeFileSync(output, uniqueNames.join('\n'));
}

(async () => {
    await level0(names);
    // 其余代码...
})();
