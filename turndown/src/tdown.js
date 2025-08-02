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
    })

    // 添加自定义规则
    addCustomRules(turndownService)

    return turndownService
}

// 添加自定义转换规则
const addCustomRules = (turndownService) => {
    // 添加规则以保留引文格式

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
        filter: (node) => {
            return node.nodeName === 'i' ||
                node.getAttribute('class').toLowerCase() === 'italic';
        },
        replacement: (content) => {
            return '*' + content + '*';
        }
    });

    // 添加规则以处理 class="break" 的段落
    turndownService.addRule('breakParagraph', {
        filter: (node) => {
            return node.getAttribute('class')=== 'calibre_20' ||  node.nodeName === 'P' && (
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
