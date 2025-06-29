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

export {
    parseJsonVocabulary,
    parseTxtVocabulary,
    jsonFormat,
    textFormat,
}