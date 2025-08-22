#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { parseJsonVocabulary, parseTxtVocabulary, parseCsvVocabulary, parseTmxVocabulary, parseTsvVocabulary } from '../web-cmp-translate/src/vocabularyParser.js';
import { customPrompt } from '../web-cmp-translate/src/prompt.js';

const args = process.argv;

const readArgs = function (args) {
    const result = {
        path: args[2]
    }
    return result;
}

const input = readArgs(args);
const source = path.resolve(input["path"], 'ensrc');
const preFiles = [
    path.resolve(input["path"], 'vocabulary.json')
    , 'web-cmp-translate/resources/names.json'
    , 'web-cmp-translate/resources/mechanicum.json'
    , 'web-cmp-translate/resources/weapon.json'
    , 'web-cmp-translate/resources/ships.json'
    , 'web-cmp-translate/resources/stars.json'
];

const postFiles = [
    './warhammer40k/legion.txt',
    './warhammer40k/mechanicum.txt',
    './warhammer40k/names.txt',
];

const postMaps = new Map([
    ["/no_think", ""]
]);

const apiUrl = 'https://openrouter.ai/api/v1';
const model = `anthropic/claude-sonnet-4`;

const envPath = path.resolve(process.cwd(), 'openrouter.ai.env');
const apiKey = (() => {
    try {
        const key = fs.readFileSync(envPath, 'utf8').trim();
        if (!key) {
            throw new Error('API key is empty.');
        }
        return key;
    } catch (error) {
        console.error(`Error reading API key from ${envPath}:`, error.message);
        process.exit(1);
    }
})();

// 加载预处理词表
const loadPreVocabularies = () => {
    const preVocabularies = new Map();

    for (const file of preFiles) {
        try {
            if (!fs.existsSync(file)) {
                console.warn(`预处理词表文件不存在: ${file}`);
                continue;
            }

            const content = fs.readFileSync(file, 'utf8');
            let vocabulary;
            const fileName = file.toLowerCase();

            if (fileName.endsWith('.json')) {
                vocabulary = parseJsonVocabulary(content);
            } else if (fileName.endsWith('.txt')) {
                vocabulary = parseTxtVocabulary(content);
            } else if (fileName.endsWith('.csv')) {
                vocabulary = parseCsvVocabulary(content);
            } else if (fileName.endsWith('.tmx')) {
                vocabulary = parseTmxVocabulary(content);
            } else if (fileName.endsWith('.tsv')) {
                vocabulary = parseTsvVocabulary(content);
            } else {
                console.warn(`不支持的文件格式: ${file}`);
                continue;
            }

            // 合并词表
            for (const [key, value] of vocabulary) {
                preVocabularies.set(key, value);
            }

            console.log(`已加载预处理词表: ${file}, 共 ${vocabulary.size} 个条目`);
        } catch (error) {
            console.error(`加载预处理词表失败 ${file}:`, error.message);
        }
    }

    return preVocabularies;
};

// 加载后处理词表
const loadPostVocabularies = () => {
    const postVocabularies = new Map();

    for (const file of postFiles) {
        try {
            if (!fs.existsSync(file)) {
                console.warn(`后处理词表文件不存在: ${file}`);
                continue;
            }

            const content = fs.readFileSync(file, 'utf8');
            let vocabulary;
            const fileName = file.toLowerCase();

            if (fileName.endsWith('.json')) {
                vocabulary = parseJsonVocabulary(content);
            } else if (fileName.endsWith('.txt')) {
                vocabulary = parseTxtVocabulary(content);
            } else if (fileName.endsWith('.csv')) {
                vocabulary = parseCsvVocabulary(content);
            } else if (fileName.endsWith('.tmx')) {
                vocabulary = parseTmxVocabulary(content);
            } else if (fileName.endsWith('.tsv')) {
                vocabulary = parseTsvVocabulary(content);
            } else {
                console.warn(`不支持的文件格式: ${file}`);
                continue;
            }

            // 合并词表
            for (const [key, value] of vocabulary) {
                postVocabularies.set(key, value);
            }

            console.log(`已加载后处理词表: ${file}, 共 ${vocabulary.size} 个条目`);
        } catch (error) {
            console.error(`加载后处理词表失败 ${file}:`, error.message);
        }
    }

    return postVocabularies;
};

// 应用词表替换
const applyVocabulary = (text, vocabulary) => {
    let result = text;
    // 将词表转换为数组并按key长度降序排序
    const sortedEntries = Array.from(vocabulary.entries()).sort((a, b) => b[0].length - a[0].length);

    for (const [key, value] of sortedEntries) {
        console.log(`替换: ${key} -> ${value}`);
        // 使用正则表达式进行全局替换，保持大小写敏感
        const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, value);
    }
    return result;
};

// AI翻译函数
const level2 = async (line) => {

    const openai = new OpenAI({
        baseURL: apiUrl,
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
        temperature: 0.7,
        defaultHeaders: {
            "HTTP-Referer": "https://vitebooks.certseeds.com/web-cmp-trans/",
            "X-Title": "vitebooks-web-cmp-translate",
        },
    });

    const prompt = customPrompt;

    try {
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: [
                        {
                            "type": "text",
                            "text": prompt,
                            "cache_control": {
                                "type": "ephemeral"
                            }
                        }
                    ]
                },
                {
                    role: "user", content: `${line}`
                }
            ]
        });

        if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
            throw new Error('Invalid response structure from API');
        }

        const data = completion.choices[0].message.content;
        return data.trim();
    } catch (error) {
        console.error(`翻译失败: ${error.message}`);
        return line; // 返回原文
    }
};

// 并行翻译函数
const translateLinesInParallel = async (lines, concurrency) => {
    const translatedLines = new Array(lines.length);
    const tasks = [];

    // 创建信号量来控制并发数
    let activeTranslations = 0;
    const maxConcurrent = concurrency;

    const translateLine = async (index) => {
        const line = lines[index].trim();

        // 跳过空行和分隔符
        if (line === '' || line === '--------') {
            translatedLines[index] = line;
            return;
        }


        // 等待获取翻译槽位
        while (activeTranslations >= maxConcurrent) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        activeTranslations++;
        console.log(`开始翻译第 ${index + 1}/${lines.length} 行 (活跃: ${activeTranslations}/${maxConcurrent})`);

        try {

            console.log(`input: ${line}`);
            const translatedLine = await level2(line);
            console.log(`output: ${translatedLine}`);
            translatedLines[index] = applyVocabulary(translatedLine, postMaps).trim();
            console.log(`完成翻译第 ${index + 1}/${lines.length} 行`);
        } catch (error) {
            console.error(`翻译第 ${index + 1} 行失败:`, error.message);
            translatedLines[index] = line; // 失败时保留原文
        } finally {
            activeTranslations--;
        }
    };

    // 创建所有翻译任务
    for (let i = 0; i < lines.length; i++) {
        tasks.push(translateLine(i));
    }

    // 等待所有任务完成
    await Promise.all(tasks);
    return translatedLines;
};

// 处理单个文件
const level1 = async (filePath, preVocabularies, postVocabularies) => {
    try {
        console.log(`开始处理文件: ${filePath}`);

        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf8');

        // 预处理：应用预处理词表
        const preprocessedContent = applyVocabulary(content, preVocabularies);

        // 按行分割
        const lines = preprocessedContent.split('\n');
        // 并行翻译所有行
        const translatedLines = await translateLinesInParallel(lines, 1);

        // 合并翻译结果
        let result = translatedLines.join('\n');

        // 后处理：应用后处理词表
        result = applyVocabulary(result, postVocabularies);

        // 生成输出文件路径
        const relativePath = path.relative(source, filePath);
        const outputPath = path.resolve(input["path"], 'src', relativePath.replace(/\.md$/, '.cn.md'));

        // 确保输出目录存在
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 写入翻译结果
        const finalResult = `${result}\n\n> translate via Vocabularies pre and post replace and \`${model}\``;
        fs.writeFileSync(outputPath, finalResult, 'utf8');
        console.log(`✓ 翻译完成: ${filePath} -> ${outputPath}`);

    } catch (error) {
        console.error(`处理文件失败 ${filePath}:`, error.message);
    }
};

// 遍历目录中的所有文件
const level0 = async () => {
    try {
        console.log('开始加载词表...');
        const preVocabularies = loadPreVocabularies();
        const postVocabularies = loadPostVocabularies();

        console.log(`预处理词表共 ${preVocabularies.size} 个条目`);
        console.log(`后处理词表共 ${postVocabularies.size} 个条目`);

        if (!fs.existsSync(source)) {
            throw new Error(`源目录不存在: ${source}`);
        }

        // 递归获取所有.md文件
        const getMarkdownFiles = (dir) => {
            const files = [];
            const items = fs.readdirSync(dir);

            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    files.push(...getMarkdownFiles(fullPath));
                } else if (stat.isFile() && item.endsWith('.md')) {
                    files.push(fullPath);
                }
            }

            return files;
        };

        const markdownFiles = getMarkdownFiles(source);
        console.log(`找到 ${markdownFiles.length} 个Markdown文件`);

        // 处理每个文件
        for (let i = 0; i < markdownFiles.length; i++) {
            const file = markdownFiles[i];
            console.log(`\n进度: ${i + 1}/${markdownFiles.length}`);
            await level1(file, preVocabularies, postVocabularies);
        }

        console.log('\n✓ 所有文件处理完成！');

    } catch (error) {
        console.error(`批量处理失败:`, error.message);
        process.exit(1);
    }
};

(async () => {
    await level0();
})();
