#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 定义要读取的文件路径模式
const filePattern = path.join(__dirname, 'src', 'chapter%02d.md');
const formatNumber = function (num) {
    return num.toString().padStart(2, '0');
}

// 生成链接的函数
function generateLink(chapter, type) {
  const chapterNumber = chapter.toString().padStart(2, '0');
  return {
    text: `Chapter ${formatNumber(chapterNumber)}`,
    link: `/深渊号之战/src/chapter${formatNumber(chapterNumber)}`
  };
}
const order = {
    "begin": 1,
    "end": 21
}
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
    if (i > order["begin"]) {
      const prevLink = generateLink(i - 1, 'prev');
      links += `prev:\n  text: '${prevLink.text}'\n  link: '${prevLink.link}'\n`;
    }
    if (i < order["end"]) {
      const nextLink = generateLink(i + 1, 'next');
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