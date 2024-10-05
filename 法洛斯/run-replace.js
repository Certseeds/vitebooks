#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 定义要读取的文件路径模式
const filePattern = path.join(__dirname, 'src', 'chapter%02d.md');

// 定义替换规则
const replacements = [
    { src: '“', dst: '"' },
    { src: '”', dst: '"' },
    { src: '。', dst: '. ' },
    { src: '，', dst: ', ' },
    { src: '？', dst: '? ' },
    { src: '（', dst: '(' },
    { src: '）', dst: ')' },
    { src: '：', dst: ': ' },
    { src: '！', dst: '! ' },
    { src: '；', dst: '; ' },
    { src: '‘', dst: '\'' },
    { src: '’', dst: '\'' },
    { src: '罗保特', dst: '罗伯特' },
    { src: '古里曼', dst: '基里曼' },
    { src: '荷露斯', dst: '荷鲁斯' },
    { src: '马格纳斯', dst: '马格努斯' },
    { src: '弗格瑞姆', dst: '福格瑞姆' },
    { src: '莫塔瑞恩', dst: '莫塔里安' },
    { src: '科尔兹', dst: '科兹' },
    { src: '沃坎', dst: '伏尔甘' },
    { src: '曼努斯', dst: '马努斯' },
    { src: '佩特拉波', dst: '佩图拉博' },
    { src: '洛加', dst: '洛迦' },
    { src: '阿兹卡隆', dst: '阿兹凯隆' },
    // 添加更多替换规则
];
// 定义第二遍替换规则
const secondReplacements = [
    { src: ', "', dst: ',"' },
    { src: '. "', dst: '."' },
    { src: '! "', dst: '!"' },
    { src: '\\? "', dst: '\\?"' },
    { src: '.  ', dst: '. ' },
    // 添加更多替换规则
];
const order = {
    "begin": 1,
    "end": 32
}
// 读取文件内容并进行替换
for (let i = order["begin"]; i <= order["end"]; i++) {
    const filePath = filePattern.replace('%02d', i.toString().padStart(2, '0'));    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`读取文件 ${filePath} 失败:`, err);
            return;
        }

        // 进行替换
        let modifiedContent = data;
        replacements.forEach(replacement => {
            const regex = new RegExp(replacement["src"], 'g');
            modifiedContent = modifiedContent.replace(regex, replacement["dst"]);
        });
        secondReplacements.forEach(replacement => {
            const regex = new RegExp(replacement["src"], 'g');
            modifiedContent = modifiedContent.replace(regex, replacement["dst"]);
        });

        // 写回文件
        fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
            if (err) {
                console.error(`写入文件 ${filePath} 失败:`, err);
            } else {
                console.log(`文件 ${filePath} 替换成功`);
            }
        });
    });
}