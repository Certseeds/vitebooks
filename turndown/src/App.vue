<template>
    <div id="app">
        <div class="container">
            <h1>HTML to Markdown Converter</h1>
            <p>上传多个html文件, 将其转换到markdown格式</p>

            <!-- File Upload Section -->
            <div class="upload-section">
                <label for="html-files" class="upload-label">
                    Select HTML Files:
                </label>
                <input id="html-files" type="file" multiple accept=".html,.htm,.xhtml" @change="handleFileUpload"
                    class="file-input" />
                <div v-if="uploadedFiles.length > 0" class="file-list">
                    <h3>Uploaded Files ({{ uploadedFiles.length }}):</h3>
                    <ul>
                        <li v-for="file in uploadedFiles" :key="file.name" class="file-item">
                            {{ file.name }} ({{ formatFileSize(file.size) }})
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Convert Button -->
            <div class="convert-section">
                <button @click="convertToMarkdown" :disabled="uploadedFiles.length === 0 || isConverting"
                    class="convert-btn">
                    {{ isConverting ? 'Converting...' : 'Convert to Markdown' }}
                </button>
            </div>

            <!-- Progress and Status -->
            <div v-if="conversionStatus.length > 0" class="status-section">
                <h3>Conversion Status:</h3>
                <div class="status-list">
                    <div v-for="status in conversionStatus" :key="status.filename" class="status-item"
                        :class="{ 'success': status.success, 'error': !status.success }">
                        <span class="filename">{{ status.filename }}</span>
                        <span class="status">{{ status.message }}</span>
                    </div>
                </div>
            </div>

            <!-- Download Section -->
            <div v-if="convertedFiles.length > 0" class="download-section">
                <h3>Converted Files:</h3>
                <button @click="downloadAllFiles" class="download-all-btn">
                    Download All Markdown Files
                </button>
                <div class="converted-list">
                    <div v-for="file in convertedFiles" :key="file.filename" class="converted-item">
                        <span class="filename">{{ file.filename }}</span>
                        <button @click="downloadSingleFile(file)" class="download-btn">
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TurndownService from 'turndown';

export default {
    name: 'App',
    data() {
        return {
            uploadedFiles: [],
            convertedFiles: [],
            conversionStatus: [],
            isConverting: false,
            turndownService: null
        };
    },
    created() {
        this.initializeTurndownService();
    },
    methods: {
        initializeTurndownService() {
            this.turndownService = new TurndownService({
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
                    return node.isBlock ? '\n\n' : '';
                },
                keepReplacement: (content, node) => {
                    return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML;
                },
                defaultReplacement: (content, node) => {
                    return node.isBlock ? '\n\n' + content + '\n\n' : content;
                }
            });

            // Add custom rules
            this.addCustomRules();
        },

        addCustomRules() {
            // 添加规则以保留引文格式
            this.turndownService.addRule('blockquote', {
                filter: 'blockquote',
                replacement: (content) => {
                    content = content.replace(/^\n+|\n+$/g, '');
                    content = content.replace(/^/gm, '> ');
                    return '\n\n' + content + '\n\n';
                }
            });

            // 添加规则以处理嵌套引文
            this.turndownService.addRule('nestedBlockquote', {
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
            this.turndownService.addRule('italic', {
                filter: 'i',
                replacement: (content) => {
                    return '*' + content + '*';
                }
            });

            // 添加规则以处理 <i> 标签为斜体
            this.turndownService.addRule('italic', {
                filter: (node) => {
                    return node.getAttribute('class') === 'Italic';
                },
                replacement: (content) => {
                    return '*' + content + '*';
                }
            });

            // 添加规则以处理 class="break" 的段落
            this.turndownService.addRule('breakParagraph', {
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
            this.turndownService.addRule('lineBreak', {
                filter: 'br',
                replacement: () => {
                    return '\n\n';
                }
            });

            // 添加规则以处理标题类段落
            this.turndownService.addRule('headingParagraphs', {
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
            this.turndownService.addRule('ignoreCaption', {
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
        },

        handleFileUpload(event) {
            const files = Array.from(event.target.files);
            this.uploadedFiles = files;
            this.convertedFiles = [];
            this.conversionStatus = [];
        },

        async convertToMarkdown() {
            if (this.uploadedFiles.length === 0) return;

            this.isConverting = true;
            this.conversionStatus = [];
            this.convertedFiles = [];

            for (const file of this.uploadedFiles) {
                try {
                    const htmlContent = await this.readFileAsText(file);
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, 'text/html');

                    // Extract body content
                    const bodyElement = doc.querySelector('body');
                    const bodyContent = bodyElement ? bodyElement.innerHTML : htmlContent;

                    // Convert to markdown
                    const markdown = this.turndownService.turndown(bodyContent);

                    // Generate filename
                    const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
                    const markdownFilename = `${originalName}.md`;

                    this.convertedFiles.push({
                        filename: markdownFilename,
                        content: markdown,
                        originalFile: file.name
                    });

                    this.conversionStatus.push({
                        filename: file.name,
                        message: 'Successfully converted',
                        success: true
                    });

                } catch (error) {
                    console.error(`Error converting ${file.name}:`, error);
                    this.conversionStatus.push({
                        filename: file.name,
                        message: `Error: ${error.message}`,
                        success: false
                    });
                }
            }

            this.isConverting = false;
        },

        readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            });
        },

        downloadSingleFile(file) {
            this.createDownload(file.content, file.filename);
        },

        downloadAllFiles() {
            this.convertedFiles.forEach(file => {
                this.createDownload(file.content, file.filename);
            });
        },

        createDownload(content, filename) {
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    }
};
</script>
