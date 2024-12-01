#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';

// 指定要读取的目录路径
const directoryPath = '' // 请替换为你的目录路径

// 读取目录中的文件名
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log('无法读取目录：' + err);
  }

  files.forEach((file) => {
    // 匹配文件名格式
    const regex = /^HH\s+\d+\s+(短篇|中篇|长篇|广播剧)\s+(.+?)\s+(.+?)\.txt$/;
    const match = file.match(regex);

    if (match) {
      const typeMap = {
        '短篇': '短篇小说',
        '中篇': '中篇小说',
        '长篇': '长篇小说',
        '广播剧': '短篇小说',
      };

      const typeKey = match[1];
      const chineseName = match[2];
      const englishName = match[3];
      const type = typeMap[typeKey];

      // 输出指定格式
      console.log('[[sub]]');
      console.log(`chinese_name = "${chineseName}"`);
      console.log(`english_name = "${englishName}"`);
      console.log(`type = "${type}"`);
      console.log(`authors = [""]`);
      console.log('');
    }
  });
});