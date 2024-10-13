#!/usr/bin/env node


const fs = require('fs');
const path = require('path');

// 定义要读取的文件路径
const filePath = path.join(__dirname, 'HH48-狼王.txt');
const formatNumber = function (num) {
    return num.toString();
}
const chapters = 6;
const numbers = "零一二三四五六七八九十".split("");
// 检查一行是否小于等于三个字并且每个字都来自numbers数组
const isChapterBegin = function (line) {
    if (0 == line.length || 3 < line.length ) {
        return false;
    }
    if (numbers.includes(line[1])) {
        return true;
    }
    return false;
}
// 读取文件内容
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('读取文件失败:', err);
        return;
    }

    // 将文件内容按行分隔存入数组
    const lines = data.split('\r\n');

    // 初始化二重数组
    const arrays = Array.from({ length: chapters }, () => []);
    console.log(arrays)

    let currentIndex = 0;

    // 扫描数组，识别出有且只有单个数字的行
    lines.forEach(line => {
        console.log('line:', line);
        const trimmedLine = line.trim();
        console.log(trimmedLine);
        if (isChapterBegin(trimmedLine)) {
            const head = `# chapter-${formatNumber(currentIndex)}`
            currentIndex += 1;
            arrays[currentIndex - 1].push(head);
        } else {
            arrays[currentIndex - 1].push(line);
        }
    });

    console.log(arrays)
    arrays.forEach((array, index) => {

        const fileName = `src/chapter${formatNumber(index)}.md`;
        const fileContent = array.join('\n');
        const filePath = path.join(__dirname, fileName);

        // 创建文件并写入内容
        fs.writeFile(filePath, fileContent, (err) => {
            if (err) {
                console.error(`写入文件 ${fileName} 失败:`, err);
            } else {
                console.log(`文件 ${fileName} 写入成功`);
            }
        });
    });
});