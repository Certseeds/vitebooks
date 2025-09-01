// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
import TurndownService from 'turndown'

// 创建并配置TurndownService
const createTurndownService = () => {
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
        br: '\n\n',  // br 标签转换为双换行
        blankReplacement: (content, node) => {
            return node.isBlock ? '\n\n' : ''
        },
        keepReplacement: (content, node) => {
            return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML
        },
        defaultReplacement: (content, node) => {
            return node.isBlock ? '\n\n' + content + '\n\n' : content
        }
    })

    // 添加自定义规则
    addCustomRules(turndownService)

    // 添加后处理函数来清理输出
    const originalTurndown = turndownService.turndown
    turndownService.turndown = function (html) {
        let markdown = originalTurndown.call(this, html)

        // 后处理：清理多余的换行和空白
        markdown = markdown
            .replace(/\n{3,}/g, '\n\n')  // 将3个或更多连续换行替换为2个
            .replace(/^\s+|\s+$/g, '')   // 移除首尾空白
            .replace(/[ \t]+$/gm, '')    // 移除行尾空白

        return markdown
    }

    return turndownService
}

// 添加自定义转换规则
const addCustomRules = (turndownService) => {

    // 首先添加段落规则，确保段落之间有换行
    turndownService.addRule('paragraph', {
        filter: 'p',
        replacement: (content) => {
            // 清理内容并确保段落间有适当换行
            content = content.trim();
            return content ? '\n\n' + content + '\n\n' : '';
        }
    })

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
        filter: (node) => {
            return node.nodeName === 'i' ||
                node.nodeName === 'em' ||
                ((node.getAttribute('class')?.toLowerCase() ?? '').includes('italic'));
        },
        replacement: (content) => {
            return '*' + content + '*';
        }
    });

    // 添加规则以处理加粗
    turndownService.addRule('strong', {
        filter: (node) => {
            return node.nodeName === 'b' ||
                node.nodeName === 'strong' ||
                ((node.getAttribute('class')?.toLowerCase() ?? '').includes('bold'));
        },
        replacement: (content) => {
            return '**' + content + '**';
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
}

export { createTurndownService }
