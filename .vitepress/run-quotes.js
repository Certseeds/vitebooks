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

// 提取一个句子中的所有汉字
const extractChineseCharacters = (text) => {
    return text.match(/[\u4e00-\u9fa5]/g) || [];
};

// 检查两个句子中汉字是否相同且顺序一致
const checkChineseCharactersMatch = (original, fixed) => {
    const originalChars = extractChineseCharacters(original);
    const fixedChars = extractChineseCharacters(fixed);
    
    if (originalChars.length !== fixedChars.length) {
        return false;
    }
    
    for (let i = 0; i < originalChars.length; i++) {
        if (originalChars[i] !== fixedChars[i]) {
            return false;
        }
    }
    
    return true;
};


// 使用qwen2.5:14b修复引号问题
const fixQuotes = async (line) => {
    const postObject = {
        "model": "qwen2.5:14b",
        "prompt": `下面是一个句子，其中引号（单引号或双引号）不成对，请修复这些引号问题，使其正确成对, 优先使用双引号, 如果是因为人名导致的则原样输出，不要改变任何汉字、标点符号的顺序和数量，也不要添加或删除任何汉字。只需修复引号问题：

"${line}"

修复后的句子（不要有任何解释，直接给出修复结果）：`,
        "stream": false,
    };

    try {
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: "POST",
            body: JSON.stringify(postObject),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log(data);
        const fixedLine = data.response.trim();
        
        // 检查修复后的句子是否保留了所有原始汉字且顺序一致
        if (checkChineseCharactersMatch(line, fixedLine)) {
            console.log(`修复成功: ${fixedLine}`);
            return fixedLine;
        } else {
            console.error(`修复失败: 汉字顺序或数量发生变化`);
            console.error(`原始: ${line}`);
            console.error(`修复后: ${fixedLine}`);
            return line; // 如果修复结果不符合要求，返回原始行
        }
    } catch (error) {
        console.error('修复引号时出错:', error);
        return line; // 出错时返回原始行
    }
};

// 处理每个文件
const processFile = async (filePath) => {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const lines = data.split('\n');
        let modified = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            console.log()
            // 检查行是否包含ERROR
            if (line.includes('ERROR')) {
                const removeErroorLine = line.replaceAll(/\[ERROR\] QUOTA NUMBER NOT MATCH/g, '');
                console.log(`发现引号错误行: ${filePath}:${i+1}`);
                console.log(`原始行: ${line}`);
                
                // 修复引号问题
                const fixedLine = await fixQuotes(removeErroorLine);
                
                if (fixedLine !== line) {
                    lines[i] = fixedLine;
                    modified = true;
                }
            }
        }
        
        // 只有在文件被修改时才写回
        if (modified) {
            await fs.promises.writeFile(filePath, lines.join('\n'), 'utf8');
            console.log(`文件 ${filePath} 修复并保存成功`);
        } else {
            console.log(`文件 ${filePath} 无需修复`);
        }
    } catch (err) {
        console.error(`处理文件 ${filePath} 时出错:`, err);
    }
};

// 处理所有文件
(async () => {
    console.log(`开始处理 ${todoFiles.length} 个文件的引号问题...`);
    
    for (const filePath of todoFiles) {
        await processFile(filePath);
    }
    
    console.log('所有文件处理完成');
})();