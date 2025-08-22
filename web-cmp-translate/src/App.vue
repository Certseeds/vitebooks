<script setup>
import { ref } from 'vue';
import { parseJsonVocabulary, parseTxtVocabulary, parseCsvVocabulary, parseTmxVocabulary, parseTsvVocabulary, jsonFormat, textFormat, csvFormat, tmxFormat, tsvFormat } from './vocabularyParser.js';
import { translate } from './api.js';
import { customPrompt } from './prompt.js';

const apiUrl = ref('http://127.0.0.1:11434/v1');
const modelName = ref('qwen2.5:14b')
const apiToken = ref('ollama');
const temperature = ref(1.3); // 预设温度值，可以通过界面调整


// Initialize from URL query parameters
const params = new URLSearchParams(window.location.search);
if (params.has('apiUrl')) { apiUrl.value = params.get('apiUrl') || apiUrl.value; }
if (params.has('modelName')) { modelName.value = params.get('modelName') || modelName.value; }
if (params.has('apiToken')) { apiToken.value = params.get('apiToken') || apiToken.value; }
if (params.has('temperature')) {
    const tempValue = parseFloat(params.get('temperature'));
    temperature.value = !isNaN(tempValue) ? tempValue : temperature.value;
};

const textFile = ref(null);
const originalFileName = ref(''); // 新增：存储原始文件名

const vocabularyFile = ref(null);

const preWordsMap = ref(new Map());
const postWordsMap = ref(new Map());

const logs = ref([]);

const sourceSegments = ref([]);
const translatedSegments = ref([]);

// 新增处理文本文件的函数
async function handleTextFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    textFile.value = file;
    originalFileName.value = file.name; // 保存原始文件名
    appendLog(`Text file selected: ${originalFileName.value}`);

    const reader = new FileReader();
    reader.onload = async (e) => {
        const fileContent = e.target.result;
        try {
            // 将文件内容按行分割，并过滤掉空行
            const lines = fileContent.split(/\r?\n/);
            sourceSegments.value = lines.filter(line => line.trim() !== '');

            appendLog(`文本文件已加载，共 ${sourceSegments.value.length} 段有效内容。`);

            // 清除旧的翻译
            translatedSegments.value = [];

            // 清空文件选择
            event.target.value = null;
            // textFile.value = null; // 保持 textFile.value 直到翻译或新文件上传，但原始文件名已保存
        } catch (error) {
            appendLog(`Error loading text file: ${error.message}`);
            event.target.value = null;
            // textFile.value = null;
            originalFileName.value = ''; // 出错时清空
        }
    };
    reader.onerror = () => {
        appendLog('Error reading text file.');
        event.target.value = null;
        // textFile.value = null;
        originalFileName.value = ''; // 出错时清空
    };
    reader.readAsText(textFile.value);
}

async function handlePreDealUpload(event) {
    vocabularyFile.value = event.target.files[0];
    console.log('File selected:', vocabularyFile.value);
    if (!vocabularyFile.value) {
        return;
    }
    appendLog(`Vocabulary file selected: ${vocabularyFile.value.name}`);

    const reader = new FileReader();
    reader.onload = async (e) => {
        const fileContent = e.target.result;
        try {
            let parsedVocab;
            const fileName = vocabularyFile.value.name.toLowerCase();

            if (fileName.endsWith('.json')) {
                parsedVocab = parseJsonVocabulary(fileContent);
                appendLog('Parsing JSON vocabulary...');
            } else if (fileName.endsWith('.txt')) {
                parsedVocab = parseTxtVocabulary(fileContent);
                appendLog('Parsing TXT vocabulary...');
            } else if (fileName.endsWith('.csv')) {
                parsedVocab = parseCsvVocabulary(fileContent);
                appendLog('Parsing CSV vocabulary...');
            } else if (fileName.endsWith('.tmx')) {
                parsedVocab = parseTmxVocabulary(fileContent);
                appendLog('Parsing TMX vocabulary...');
            } else if (fileName.endsWith('.tsv')) {
                parsedVocab = parseTsvVocabulary(fileContent);
                appendLog('Parsing TSV vocabulary...');
            } else {
                appendLog('Unsupported file type. Please upload a .json, .txt, .csv, .tmx, or .tsv file.');
                // 清空文件选择，以便可以再次选择同一个文件
                event.target.value = null;
                vocabularyFile.value = null;
                return;
            }
            // 更新词汇表, 合并而不是替换
            parsedVocab.forEach((value, key) => {
                appendLog(`新预处理词对: ${key} - ${value}`);
                preWordsMap.value.set(key, value);
            });
            appendLog(`Vocabulary loaded successfully. Total entries: ${preWordsMap.value.size}`);
            // 清空文件选择，以便可以再次选择同一个文件
            event.target.value = null;
            vocabularyFile.value = null;
        } catch (error) {
            appendLog(`Error loading vocabulary: ${error.message}`);
            // 清空文件选择，以便可以再次选择同一个文件
            event.target.value = null;
            vocabularyFile.value = null;
        }
    };
    reader.onerror = () => {
        appendLog('Error reading file.');
        // 清空文件选择，以便可以再次选择同一个文件
        event.target.value = null;
        vocabularyFile.value = null;
    };
    reader.readAsText(vocabularyFile.value);
}

async function handleAfterDealUpload(event) {
    vocabularyFile.value = event.target.files[0];
    console.log('After-deal file selected:', vocabularyFile.value);
    if (!vocabularyFile.value) {
        return;
    }
    appendLog(`后处理词表文件已选择: ${vocabularyFile.value.name}`);

    const reader = new FileReader();
    reader.onload = async (e) => {
        const fileContent = e.target.result;
        try {
            let parsedVocab;
            const fileName = vocabularyFile.value.name.toLowerCase();

            if (fileName.endsWith('.json')) {
                parsedVocab = parseJsonVocabulary(fileContent);
                appendLog('解析JSON后处理词表...');
            } else if (fileName.endsWith('.txt')) {
                parsedVocab = parseTxtVocabulary(fileContent);
                appendLog('解析TXT后处理词表...');
            } else if (fileName.endsWith('.csv')) {
                parsedVocab = parseCsvVocabulary(fileContent);
                appendLog('解析CSV后处理词表...');
            } else if (fileName.endsWith('.tmx')) {
                parsedVocab = parseTmxVocabulary(fileContent);
                appendLog('解析TMX后处理词表...');
            } else if (fileName.endsWith('.tsv')) {
                parsedVocab = parseTsvVocabulary(fileContent);
                appendLog('解析TSV后处理词表...');
            } else {
                appendLog('不支持的文件类型。请上传 .json, .txt, .csv, .tmx 或 .tsv 文件。');
                event.target.value = null;
                vocabularyFile.value = null;
                return;
            }
            // 更新后处理词汇表
            parsedVocab.forEach((value, key) => {
                appendLog(`新后处理词对: ${key} - ${value}`);
                postWordsMap.value.set(key, value);
            });
            appendLog(`后处理词表加载成功。总词条数: ${postWordsMap.value.size}`);
            event.target.value = null;
            vocabularyFile.value = null;
        } catch (error) {
            appendLog(`加载后处理词表错误: ${error.message}`);
            event.target.value = null;
            vocabularyFile.value = null;
        }
    };
    reader.onerror = () => {
        appendLog('读取后处理词表文件错误。');
        event.target.value = null;
        vocabularyFile.value = null;
    };
    reader.readAsText(vocabularyFile.value);
}

// 新增：公共翻译函数
async function translateSingleSegment(segment, index) {
    // 应用预处理词表替换
    const sortedPreKeys = Array.from(preWordsMap.value.keys())
        .sort((a, b) => b.length - a.length);

    let processedSegment = segment;
    if (preWordsMap.value.size > 0) {
        const originalSegmentForLogging = segment;
        for (const key of sortedPreKeys) {
            const escapedKey = key.replace(/[.*+?^${}()|[\\\]\\\\]/g, '\\\\$&');
            const regex = new RegExp(escapedKey, 'gi'); // 全局不区分大小写
            const replacement = preWordsMap.value.get(key);
            processedSegment = processedSegment.replaceAll(regex, replacement);
        }

        if (processedSegment !== originalSegmentForLogging) {
            appendLog(`段落 ${index + 1} 已完成预处理替换。`);
        }
    }

    // 调用翻译API
    const translatedText = await translate(
        apiUrl.value,
        apiToken.value,
        modelName.value,
        customPrompt || '请将以下文本翻译为中文：',
        processedSegment,
        temperature.value
    );

    // 应用后处理词表替换
    let processedTranslation = translatedText;
    if (postWordsMap.value.size > 0) {
        postWordsMap.value.forEach((value, keyRegexString) => {
            try {
                const regex = new RegExp(keyRegexString, 'g');
                processedTranslation = processedTranslation.replaceAll(regex, value);
            } catch (regexError) {
                appendLog(`后处理正则表达式错误 (${keyRegexString}): ${regexError.message}`);
            }
        });

        if (processedTranslation !== translatedText) {
            appendLog(`段落 ${index + 1} 已完成后处理替换。`);
        }
    }

    return processedTranslation;
}

// 新增：重试单个段落的翻译
async function retryTranslateSegment(index) {
    if (index < 0 || index >= sourceSegments.value.length) {
        appendLog(`错误：段落索引 ${index} 超出范围。`);
        return;
    }

    appendLog(`开始重试翻译段落 ${index + 1}...`);

    // 设置该段落为翻译中状态
    translatedSegments.value[index] = '重新翻译中...';

    try {
        const result = await translateSingleSegment(sourceSegments.value[index], index);
        translatedSegments.value[index] = result;
        appendLog(`重试翻译完成 ${index + 1}: ${sourceSegments.value[index].substring(0, 50)}... -> ${result.substring(0, 50)}...`);
    } catch (error) {
        translatedSegments.value[index] = sourceSegments.value[index]; // 如果翻译失败，保留原文
        appendLog(`重试翻译失败 ${index + 1}: ${error.message}`);
    }
}

async function translateText() {
    appendLog('Translate button clicked.');

    if (sourceSegments.value.length === 0) {
        appendLog('没有有效的原文分段可供翻译。请先上传文本文件。');
        translatedSegments.value = [];
        return;
    }

    appendLog(`开始翻译 ${sourceSegments.value.length} 段原文。`);

    // 初始化译文数组
    translatedSegments.value = new Array(sourceSegments.value.length).fill('翻译中...');

    // 按长度从长到短排序预处理词表的键
    const sortedPreKeys = Array.from(preWordsMap.value.keys())
        .sort((a, b) => b.length - a.length);

    if (sortedPreKeys.length > 0) {
        appendLog(`已加载预处理词表，将对原文进行 ${sortedPreKeys.length} 个词条的预处理替换。`);
    }

    // 逐一翻译每个分段
    for (let index = 0; index < sourceSegments.value.length; index++) {
        try {
            const result = await translateSingleSegment(sourceSegments.value[index], index);
            translatedSegments.value[index] = result;
            appendLog(`翻译完成 ${index + 1}/${sourceSegments.value.length}: ${sourceSegments.value[index].substring(0, 50)}... -> ${result.substring(0, 50)}...`);
        } catch (error) {
            translatedSegments.value[index] = sourceSegments.value[index]; // 如果翻译失败，保留原文
            appendLog(`翻译失败 ${index + 1}/${sourceSegments.value.length}: ${error.message}`);
        }
    }

    appendLog(`翻译完成，共处理 ${translatedSegments.value.length} 条分段。`);
}

function exportTranslatedFile() {
    if (!originalFileName.value) {
        appendLog('错误：未找到原始文件名，无法导出。请先上传并处理一个文本文件。');
        return;
    }
    if (translatedSegments.value.length === 0) {
        appendLog('没有翻译内容可供导出。');
        return;
    }

    const nameParts = originalFileName.value.split('.');
    let baseName;
    if (nameParts.length > 1) {
        baseName = nameParts.slice(0, -1).join('.');
    } else {
        baseName = originalFileName.value; // 如果文件名没有扩展名
    }
    const outputFilename = `${baseName}.translate.md`;

    const content = translatedSegments.value.join('\r\n\r\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', outputFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    appendLog(`已导出文件: ${outputFilename}`);
}

function appendLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    logs.value.push(`[${timestamp}] ${message}`);
    // 保持日志数量不超过一定值，例如100条
    if (logs.value.length > 100) {
        logs.value.shift();
    }
}

</script>

<template>
    <div class="app-container">
        <div class="main-content">
            <!-- 文本文件上传按钮 -->
            <div class="file-upload-section">
                <input type="file" @change="handleTextFileUpload" accept=".txt,.md">
                <label>选择要翻译的文本文件 (txt, md)</label>
            </div> <!-- 段落式显示区域 -->
            <div class="segments-container">
                <div v-if="sourceSegments.length === 0" class="no-content">
                    <p>请先上传文本文件</p>
                </div>
                <div v-else>
                    <div v-for="(segment, index) in sourceSegments" :key="index" class="row">
                        <div class="original-segment clickable-segment" @click="retryTranslateSegment(index)"
                            :title="'点击重试翻译段落 ' + (index + 1)">
                            <p class="segment-content">{{ segment }}</p>
                            <div class="retry-hint">点击重试</div>
                        </div>
                        <div class="translated-segment">
                            <p class="segment-content">
                                {{ translatedSegments[index] || '待翻译...' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="sidebar">
            <div class="sidebar-top">
                <h3>API 设置</h3>
                <input type="text" v-model="apiUrl" placeholder="deepseek的API为 https://api.deepseek.com">
                <input type="text" v-model="modelName" placeholder="deepseek-V3的模型名为 deepseek-chat">
                <input type="password" v-model="apiToken" placeholder="API Token">
                <label>温度 (0-2)：</label>
                <input type="number" v-model.number="temperature" min="0" max="2" step="0.1"
                    placeholder="越低越稳定, 越高输出越多样化">
            </div>
            <div class="sidebar-middle">
                <h3 class="section-header-with-tooltip"
                    :title="'词表格式说明：\n\n' + jsonFormat + '\n\n' + textFormat + '\n\n' + csvFormat + '\n\n' + tmxFormat + '\n\n' + tsvFormat">
                    词表和 Prompt
                </h3>
                <div class="file-input-group">
                    <label>预处理词表：</label>
                    <input type="file" @change="handlePreDealUpload" accept=".json,.txt,.csv,.tmx,.tsv">
                </div>
                <div class="file-input-group">
                    <label>后处理词表：</label>
                    <input type="file" @change="handleAfterDealUpload" accept=".json,.txt,.csv,.tmx,.tsv">
                </div>
                <textarea v-model="customPrompt" placeholder="自定义 Prompt"></textarea>
            </div>
            <button @click="translateText" class="translate-button">翻译</button>
            <button @click="exportTranslatedFile" class="export-button">导出译文</button>

            <div class="sidebar-bottom">
                <h3>日志</h3>
                <div class="log-display">
                    <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.app-container {
    display: flex;
    height: 100vh;
    font-family: sans-serif;
}

.main-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
}

.file-upload-section {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.file-upload-section label {
    font-weight: bold;
    color: #333;
}

.segments-container {
    flex-grow: 1;
    overflow-y: auto;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
}

.no-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    font-style: italic;
}

.row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
    background-color: #fafafa;
}

.original-segment,
.translated-segment {
    flex: 1;
    padding: 10px;
    border-radius: 4px;
}

.original-segment {
    background-color: #e8f4fd;
    border-left: 4px solid #007bff;
    position: relative;
}

.clickable-segment {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.clickable-segment:hover {
    background-color: #d1ecf1;
}

.clickable-segment:hover .retry-hint {
    opacity: 1;
}

.retry-hint {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: rgba(0, 123, 255, 0.8);
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
}

.translated-segment {
    background-color: #f0f9ff;
    border-left: 4px solid #28a745;
}

.segment-content {
    margin: 0;
    line-height: 1.5;
    color: #333;
}

.sidebar {
    width: 300px;
    min-width: 300px;
    /* 新增：确保侧边栏最小宽度 */
    padding: 10px;
    border-left: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.sidebar-top,
.sidebar-middle,
.sidebar-bottom {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.sidebar-bottom {
    flex-grow: 1;
    /* 使日志区域填满剩余空间 */
    overflow-y: hidden;
    /* 隐藏日志区域本身的滚动条 */
}

.log-display {
    border: 1px solid #eee;
    padding: 10px;
    height: 100%;
    /* 确保日志显示区域填满其父容器 */
    overflow-y: auto;
    /* 当内容超出时显示滚动条 */
    background-color: #f9f9f9;
    font-size: 12px;
    line-height: 1.4;
}

input[type="text"],
input[type="password"],
input[type="file"],
textarea {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: calc(100% - 16px);
    /* 减去padding */
}

/* 更新文件上传按钮的标签文本，使其更清晰 */
.file-upload-section input[type="file"]+label {
    margin-left: 10px;
    /* 如果需要，可以调整间距 */
}


.file-input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.file-input-group label {
    font-size: 14px;
    font-weight: bold;
    color: #555;
}

.translate-button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    text-align: center;
}

.translate-button:hover {
    background-color: #0056b3;
}

.export-button {
    padding: 10px 15px;
    background-color: #28a745;
    /* 绿色背景 */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    text-align: center;
    margin-top: 10px;
    /* 与翻译按钮的间距 */
}

.export-button:hover {
    background-color: #218838;
    /* 深绿色 */
}

h3 {
    margin-top: 0;
    margin-bottom: 5px;
    font-size: 16px;
}

.section-header-with-tooltip {
    cursor: help;
    position: relative;
    color: #333;
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: #007bff;
}

.section-header-with-tooltip:hover {
    color: #007bff;
}

.temperature-setting {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.temperature-setting label {
    font-size: 14px;
    font-weight: bold;
    color: #555;
}

input[type="number"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: calc(100% - 16px);
    /* 减去padding */
}
</style>
