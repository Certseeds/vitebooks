const isEnglish = (str) => {
    return /^[a-zA-Z\s\-',.]+$/.test(str);
};

const parseJsonVocabulary = function (jsonString) {
    const vocabulary = new Map();
    try {
        const data = JSON.parse(jsonString);
        if (data && data.keywords) {
            for (const categoryKey in data.keywords) {
                if (Object.hasOwnProperty.call(data.keywords, categoryKey)) {
                    const category = data.keywords[categoryKey];
                    for (const termKey in category) {
                        if (Object.hasOwnProperty.call(category, termKey)) {
                            // 如果key是英文，则转换为小写
                            const processedKey = isEnglish(termKey) ? termKey.toLowerCase() : termKey;
                            vocabulary.set(processedKey, category[termKey]);
                        }
                    }
                }
            }
        }
        return vocabulary;
    } catch (error) {
        console.error("Error parsing JSON vocabulary:", error);
        throw new Error("Invalid JSON file format.");
    }
}

const jsonFormat = `JSON格式要求:

最外层是一个 JSON 对象.
该对象必须包含一个名为 "keywords" 的键.
"keywords" 的值是另一个对象, 它可以包含一个或多个 "分类" 对象.
每个 "分类" 对象内部是真正的键值对, 其中 "键" 是原文词汇, "值" 是要替换成的译文.
JSON格式的优势在于, "键" 内部可以有空格

示例:
{
    "keywords": {
        "locations": {
            "Macragge": "马库拉格",
            "Terra": "泰拉"
        },
        "characters": {
            "Vulkan": "伏尔甘",
            "Zhaetos": "宰托斯"
        },
        "organizations": {
            "Word Bearers": "怀言者",
            "Death Guard": "死亡守卫"
        }
    }
}

注意, key可以是正则表达式, 如果没有使用经验不推荐使用
`;

const parseTxtVocabulary = function (txtString) {
    const vocabulary = new Map();
    try {
        const lines = txtString.split(/\r?\n/);
        for (const line of lines) {
            if (line.trim() === "") {
                continue;
            }
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
                const key = parts[0];
                const value = parts.slice(1).join(" ");
                const processedKey = isEnglish(key) ? key.toLowerCase() : key;
                vocabulary.set(processedKey, value);
            }
        }
        return vocabulary;
    } catch (error) {
        console.error("Error parsing TXT vocabulary:", error);
        throw new Error("Error processing TXT file.");
    }
}

const textFormat = `TXT格式要求:

需要纯文本作为输入, 格式相对简单.

格式要求:
每一行代表一个词条.
每行中, 第一个由空格分隔的单词是 "键" (原文).
该行中, 第一个单词之后的所有内容都被视为 "值" (译文).
空行会被忽略.

示例:
Macragge 马库拉格
Terra 泰拉
Vulkan 伏尔甘

注意, key可以是正则表达式, 如果没有使用经验不推荐使用
`;

/**
 * Parse CSV vocabulary file
 * @param {string} csvString - CSV file content
 * @returns {Map<string, string>} - Map of source to target translations
 */
const parseCsvVocabulary = function (csvString) {
    const vocabulary = new Map();
    try {
        const lines = csvString.split(/\r?\n/);
        
        // Skip header if it exists (Source,Target)
        let startIndex = 0;
        if (lines.length > 0 && lines[0].toLowerCase().includes('source') && lines[0].toLowerCase().includes('target')) {
            startIndex = 1;
        }
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Simple CSV parsing - handle quoted fields
            const parts = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    parts.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            parts.push(current.trim());
            
            if (parts.length >= 2) {
                const source = parts[0].replace(/^"|"$/g, '').trim();
                const target = parts[1].replace(/^"|"$/g, '').trim();
                if (source && target) {
                    const processedKey = isEnglish(source) ? source.toLowerCase() : source;
                    vocabulary.set(processedKey, target);
                }
            }
        }
        return vocabulary;
    } catch (error) {
        console.error("Error parsing CSV vocabulary:", error);
        throw new Error("Error processing CSV file.");
    }
}

const csvFormat = `CSV格式要求:

CSV (Comma-Separated Values) 格式支持, 使用逗号分隔源语言和目标语言.

格式要求:
第一行可以是标题行 (Source,Target), 会被自动跳过.
每行包含两个字段: 源文本和目标译文.
支持使用双引号包围包含逗号的文本.
空行会被忽略.

示例:
Source,Target
"Macragge","马库拉格"
"Terra","泰拉"
"Vulkan","伏尔甘"
"Word Bearers","怀言者"

或无标题行:
"Macragge","马库拉格"
"Terra","泰拉"
"Vulkan","伏尔甘"

注意, key可以是正则表达式, 如果没有使用经验不推荐使用
`;

/**
 * Parse TMX vocabulary file
 * @param {string} tmxString - TMX file content
 * @returns {Map<string, string>} - Map of source to target translations
 */
const parseTmxVocabulary = function (tmxString) {
    const vocabulary = new Map();
    try {
        // Create a temporary DOM parser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(tmxString, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Invalid XML format');
        }
        
        // Get all translation units
        const tuElements = xmlDoc.querySelectorAll('tu');
        
        tuElements.forEach(tu => {
            const tuvElements = tu.querySelectorAll('tuv');
            if (tuvElements.length >= 2) {
                const segments = [];
                
                tuvElements.forEach(tuv => {
                    const seg = tuv.querySelector('seg');
                    if (seg) {
                        segments.push(seg.textContent.trim());
                    }
                });
                
                // Assume first segment is source, second is target
                if (segments.length >= 2 && segments[0] && segments[1]) {
                    const processedKey = isEnglish(segments[0]) ? segments[0].toLowerCase() : segments[0];
                    vocabulary.set(processedKey, segments[1]);
                }
            }
        });
        
        return vocabulary;
    } catch (error) {
        console.error("Error parsing TMX vocabulary:", error);
        throw new Error("Error processing TMX file.");
    }
}

const tmxFormat = `TMX格式要求:

TMX (Translation Memory eXchange) 是翻译记忆库交换的标准XML格式.

格式要求:
标准XML格式, 包含 <tmx>, <body>, <tu> (翻译单元) 和 <tuv> (翻译单元变体) 元素.
每个 <tu> 包含一对或多对翻译.
每个 <tuv> 包含一个 <seg> 元素, 内容是实际的文本.
第一个 <tuv> 被视为源语言, 第二个被视为目标语言.

示例:
<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <header>
    <prop type="x-filename">vocabulary.tmx</prop>
  </header>
  <body>
    <tu tuid="1">
      <tuv xml:lang="en">
        <seg>Macragge</seg>
      </tuv>
      <tuv xml:lang="zh">
        <seg>马库拉格</seg>
      </tuv>
    </tu>
    <tu tuid="2">
      <tuv xml:lang="en">
        <seg>Terra</seg>
      </tuv>
      <tuv xml:lang="zh">
        <seg>泰拉</seg>
      </tuv>
    </tu>
  </body>
</tmx>

注意, key可以是正则表达式, 如果没有使用经验不推荐使用
`;

/**
 * Parse TSV vocabulary file  
 * @param {string} tsvString - TSV file content
 * @returns {Map<string, string>} - Map of source to target translations
 */
const parseTsvVocabulary = function (tsvString) {
    const vocabulary = new Map();
    try {
        const lines = tsvString.split(/\r?\n/);
        
        // Skip header if it exists (Source\tTarget)
        let startIndex = 0;
        if (lines.length > 0 && lines[0].toLowerCase().includes('source') && lines[0].toLowerCase().includes('target')) {
            startIndex = 1;
        }
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split('\t');
            if (parts.length >= 2) {
                const source = parts[0].trim();
                const target = parts[1].trim();
                if (source && target) {
                    const processedKey = isEnglish(source) ? source.toLowerCase() : source;
                    vocabulary.set(processedKey, target);
                }
            }
        }
        return vocabulary;
    } catch (error) {
        console.error("Error parsing TSV vocabulary:", error);
        throw new Error("Error processing TSV file.");
    }
}

const tsvFormat = `TSV格式要求:

TSV (Tab-Separated Values) 格式使用制表符分隔源语言和目标语言.

格式要求:
第一行可以是标题行 (Source[Tab]Target), 会被自动跳过.
每行包含两个字段, 用制表符 (Tab) 分隔: 源文本和目标译文.
制表符比逗号更适合包含标点符号的文本.
空行会被忽略.

示例:
Source	Target
Macragge	马库拉格
Terra	泰拉
Vulkan	伏尔甘
Word Bearers	怀言者

或无标题行:
Macragge	马库拉格
Terra	泰拉
Vulkan	伏尔甘

注意, key可以是正则表达式, 如果没有使用经验不推荐使用
`;

export {
    parseJsonVocabulary,
    parseTxtVocabulary,
    parseCsvVocabulary,
    parseTmxVocabulary,
    parseTsvVocabulary,
    jsonFormat,
    textFormat,
    csvFormat,
    tmxFormat,
    tsvFormat,
}