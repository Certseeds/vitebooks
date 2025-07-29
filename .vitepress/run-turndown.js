#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';

const args = process.argv;

const readArgs = function (args) {
    const result = {
        path: args[2]
    }
    return result;
}

const input = readArgs(args);
const htmlsPath = `${input["path"]}/htmls`;
const ensrcPath = `${input["path"]}/ensrc`;

// 配置Turndown服务
const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
    br: '  ',
    blankReplacement: (content, node) => {
        return node.isBlock ? '\n\n' : ''
    },
    keepReplacement: (content, node) => {
        return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML
    },
    defaultReplacement: (content, node) => {
        return node.isBlock ? '\n\n' + content + '\n\n' : content
    }
});

// TODO, 将逻辑剥离到子目录中, import进来

// 添加规则以保留引文格式
turndownService.addRule('blockquote', {
    filter: 'blockquote',
    replacement: (content) => {
        content = content.replace(/^\n+|\n+$/g, '');
        content = content.replace(/^/gm, '> ');
        return '\n\n' + content + '\n\n';
    }
});

// 添加规则以处理嵌套引文
turndownService.addRule('nestedBlockquote', {
    filter: (node) => {
        return node.nodeName === 'BLOCKQUOTE' && node.parentNode.nodeName === 'BLOCKQUOTE';
    },
    replacement: (content) => {
        content = content.replace(/^\n+|\n+$/g, '');
        content = content.replace(/^/gm, '> ');
        return '\n\n' + content + '\n\n';
    }
});

// 添加规则以处理 <i> 标签为斜体
turndownService.addRule('italic', {
    filter: 'i',
    replacement: (content) => {
        return '*' + content + '*';
    }
});

// 添加规则以处理 <i> 标签为斜体
turndownService.addRule('italic', {
    filter: (node) => {
        return node.getAttribute('class') === 'Italic' ;
    },
    replacement: (content) => {
        return '*' + content + '*';
    }
});

// 添加规则以处理 class="break" 的段落
turndownService.addRule('breakParagraph', {
    filter: (node) => {
        return node.nodeName === 'P' && (
            node.getAttribute('class') === 'break' ||
            node.getAttribute('class') === 'No_Indent'
        );
    },
    replacement: (content) => {
        return '\n\n--------\n\n' + content + '\n\n';
    }
});

// 添加规则以处理 <br> 标签
turndownService.addRule('lineBreak', {
    filter: 'br',
    replacement: () => {
        return '\n\n';
    }
});

// 添加规则以处理标题类段落
turndownService.addRule('headingParagraphs', {
    filter: (node) => {
        if (node.nodeName !== 'P') return false;
        const className = node.getAttribute('class');
        return className && ['h1', 'h2', 's0', 's1', 's2'].includes(className);
    },
    replacement: (content, node) => {
        const className = node.getAttribute('class');
        if (className === 'h1' || className === 'h2' || className === 's0') {
            return '\n\n# ' + content + '\n\n';
        } else if (className === 's1' || className === 's2') {
            return '\n\n## ' + content + '\n\n';
        }
        return content;
    }
});

// 添加规则以忽略 caption 类的段落
turndownService.addRule('ignoreCaption', {
    filter: (node) => {
        return node.nodeName === 'P' && (
            node.getAttribute('class') === 'caption' ||
            node.getAttribute('class') === 'HH_Captions'
        );
    },
    replacement: () => {
        return '';
    }
});

// 处理HTML文件并提取body内容转换为Markdown
const processHtmlFile = async (filePath) => {
    try {
        console.log(`处理文件: ${filePath}`);

        // 读取HTML文件
        const htmlContent = fs.readFileSync(filePath, 'utf8');

        // 使用JSDOM解析HTML
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        // 提取body内容
        const bodyElement = document.querySelector('body');
        if (!bodyElement) {
            console.warn(`警告: 文件 ${filePath} 中没有找到body元素`);
            return null;
        }

        // 获取body的innerHTML
        const bodyHtml = bodyElement.innerHTML;

        // 转换为Markdown
        const markdown = turndownService.turndown(bodyHtml);

        // 清理多余的空行
        const cleanedMarkdown = markdown
            .replace(/\n{3,}/g, '\n\n')  // 将3个或更多连续换行替换为2个
            .trim();  // 去除首尾空白

        return cleanedMarkdown;

    } catch (error) {
        console.error(`处理文件 ${filePath} 时出错:`, error.message);
        return null;
    }
};

// 处理目录中的所有HTML文件
const processDirectory = async (dirPath) => {
    try {
        const files = fs.readdirSync(dirPath);
        const htmlFiles = files.filter(file => path.extname(file).toLowerCase() === '.html');

        console.log(`在目录 ${dirPath} 中找到 ${htmlFiles.length} 个HTML文件`);

        const results = [];

        for (const htmlFile of htmlFiles) {
            const filePath = path.join(dirPath, htmlFile);
            const markdown = await processHtmlFile(filePath);

            if (markdown !== null) {
                const outputFileName = path.basename(htmlFile, '.html') + '.md';
                const outputPath = path.join(ensrcPath, outputFileName);

                // 写入Markdown文件
                fs.writeFileSync(outputPath, markdown, 'utf8');
                console.log(`✓ 已转换: ${htmlFile} -> ${outputFileName}`);

                results.push({
                    source: htmlFile,
                    output: outputFileName,
                    success: true
                });
            } else {
                console.log(`✗ 转换失败: ${htmlFile}`);
                results.push({
                    source: htmlFile,
                    output: null,
                    success: false
                });
            }
        }

        return results;

    } catch (error) {
        console.error(`处理目录 ${dirPath} 时出错:`, error.message);
        return [];
    }
};

// 批量处理多个目录
const processDirectories = async (directory) => {
    const allResults = [];

    const results = await processDirectory(directory);
    allResults.push({
        directory: directory,
        results: results
    });

    return allResults;
};


// 主程序执行
const main = async () => {
    console.log('HTML to Markdown 转换工具');
    console.log('============================');

    if (!htmlsPath) {
        console.error('错误: 请提供目标路径');
        console.log('用法: node run-turndown.js <目录路径>');
        process.exit(1);
    }

    console.log(`目标路径: ${htmlsPath}\n`);


    // 处理目录
    const results = await processDirectories(htmlsPath);

    // 输出统计信息
    console.log('\n转换统计:');
    console.log('==========');

    let totalProcessed = 0;
    let totalSuccess = 0;

    for (const dirResult of results) {
        const successCount = dirResult.results.filter(r => r.success).length;
        const totalCount = dirResult.results.length;

        console.log(`目录 ${successCount}/${totalCount} 个文件转换成功`);

        totalProcessed += totalCount;
        totalSuccess += successCount;
    }

    console.log(`\n总计: ${totalSuccess}/${totalProcessed} 个文件转换成功`);

};

// 运行主程序
main().catch(console.error);
