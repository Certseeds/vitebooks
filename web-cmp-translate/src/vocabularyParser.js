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

export {
    parseJsonVocabulary,
    parseTxtVocabulary
}