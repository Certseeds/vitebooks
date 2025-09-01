#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import OpenAI from 'openai';

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

// openai风格的调用, 
const fixQuotes = async (line) => {
    const envPath = path.resolve(process.cwd(), 'openrouter.ai.env');
    let apiKey;
    try {
        apiKey = fs.readFileSync(envPath, 'utf8').trim();
        if (!apiKey) {
            throw new Error('API key is empty.');
        }
    } catch (error) {
        console.error(`Error reading API key from ${envPath}:`, error.message);
        process.exit(1);
    }

    const apiUrl = 'https://openrouter.ai/api/v1';

    const openai = new OpenAI({
        baseURL: apiUrl,
        apiKey: apiKey, // required but unused
        dangerouslyAllowBrowser: true,
        temperature: 0.7,
        defaultHeaders: {
            "HTTP-Referer": "https://vitebooks.certseeds.com/web-cmp-trans/",
            "X-Title": "vitebooks-web-cmp-translate",
        }, // localhost Ollama do not accept any other headers
    })
    const prompt = "你是一个用于修复文本中引号问题的工具。你会收到一个句子，其中引号（单引号或双引号）可能不成对。你的任务是修复这些引号问题，使其正确成对。请优先使用双引号。如果问题是由人名中的特殊字符引起的，请保持原样。不要改变任何汉字、标点符号的顺序和数量，也不要添加或删除任何汉字。只需修复引号问题，并直接返回修复后的句子，不要包含任何解释或额外文本。";
    const model = `anthropic/claude-sonnet-4`; // gemini-2.5-pro 思考太消耗token了
    const completion = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system", content: [
                    {
                        "type": "text",
                        "text": prompt,
                        "cache_control": {
                            "type": "ephemeral"
                        }
                    },

                ]
            }
            , { role: "user", content: `${line}` }
        ]
    })
    if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
        throw new Error('Invalid response structure from API');
    }
    const data = completion.choices[0].message.content;
    try {
        const fixedLine = data.trim();
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
}

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
                console.log(`发现引号错误行: ${filePath}:${i + 1}`);
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