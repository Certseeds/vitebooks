#!/usr/bin/env node


const fs = require('fs');
const path = require('path');

// 定义要读取的文件路径
const filePath = path.join(__dirname, 'HH27.txt');
const formatNumber = function (num) {
    return num.toString().padStart(2, '0');
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
    const arrays = Array.from({ length: 25 }, () => []);
    console.log(arrays)

    let currentIndex = 0;

    // 扫描数组，识别出有且只有单个数字的行
    lines.forEach(line => {
        const trimmedLine = line.trim();
        const singleDigitRegex = /^\d{1,2}$/;
        if (singleDigitRegex.test(trimmedLine)) {
            const number = parseInt(trimmedLine, 10);
            if (number === currentIndex + 1) {
                currentIndex = number;
            }
            const head = `# chapter-${formatNumber(currentIndex)}`
            arrays[currentIndex - 1].push(head);
        }else{
            arrays[currentIndex - 1].push(line);
        }
    });

    console.log(arrays)
    arrays.forEach((array, index) => {
        array[1] = `## ${array[1]}`;
        const fileName = `src/chapter${formatNumber(index + 1)}.md`;
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