#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const args = process.argv;

const readArgs = function (args) {
    const result = {
        path: args[2]
    }
    return result;
}
const input = readArgs(args);
const modulePath = path.resolve(input["path"], 'module.js');
const bookModule = require(modulePath);

const todoFiles = bookModule.replaceDirs.reduce((acc, dir) => {
    const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.md'))
        .map(file => path.resolve(dir, file));
    return acc.concat(files);
}, []).concat(bookModule.repalceFiles);

// 定义要读取的文件路径模式

// 遍历 JSON 对象的键值对
const symbolMap = JSON.parse(fs.readFileSync("./warhammer40k/symbol.json", 'utf8'));
const replacementSymbol = Object.entries(symbolMap).map(([key, value]) => ({
    src: `${key}`,
    dst: `${value}`
}));
console.log(replacementSymbol)
const replacementNames = bookModule.repalceNameFiles
    .concat("./warhammer40k/name.txt")
    .reduce((acc, filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .sort()
            .map(line => {
                const [src, dst] = line.split(' ');
                return {
                    "src": `${src}`,
                    "dst": `${dst}`
                };
            });
        return acc.concat(lines);
    }, []);

// 定义第二遍替换规则
const secondReplacements = [
    { src: ', "', dst: ',"' },
    { src: '! "', dst: '!"' },
    { src: `\\. "`, dst: '."' },
    { src: '\\? "', dst: '?"' },
];
const isChineseCharacter = function (char) {
    const chineseRegex = /[\u4e00-\u9fa5]/;
    return chineseRegex.test(char);
}
const thirdReplacement = (text) => {
    let lines = text.split('\n');
    let resultLines = lines
        //.map(line => line.trim())
        .map(line => {
            let result = '';
            if (line.trim().length === 0) {
                return result;
            }
            const doubleQuotes = (line) => line.split('').reduce((count, char) => char === '"' ? count + 1 : count, 0);
            for (let i = 0, numbers = 0; i < line.length; i++) {
                if (line[i] === '"') {
                    numbers++;
                }
                if (numbers % 2 === 0 && line[i] === '"' && i + 1 < line.length && isChineseCharacter(line[i + 1])) {
                    result += '" ';
                } else {
                    result += line[i];
                }
            }
            return result;
        });
    return resultLines.join('\n');
};
const fourthReplacement = (text) => {
    let lines = text.split('\n');
    let resultLines = lines
        //.map(line => line.trim())
        .map(line => {
            let result = '';
            if (line.trim().length === 0) {
                return result;
            }
            const doubleQuotes = (line) => line.split('').reduce((count, char) => char === '"' ? count + 1 : count, 0);
            for (let i = 0, numbers = 0; i < line.length; i++) {
                if (line[i] === '"') {
                    numbers++;
                }
                if (numbers % 2 === 1 && line[i] === '"' && '.' === line[i - 1]) {
                    result += ' "';
                } else {
                    result += line[i];
                }
            }
            return result;
        });
    return resultLines.join('\n');
};
const fifthReplacement = (text) => {
    let lines = text.split('\n');
    let resultLines = lines
        //.map(line => line.trim())
        .map(line => {
            let result = '';
            if (line.trim().length === 0) {
                return result;
            }
            const doubleQuotes = (line) => line.split('').reduce((count, char) => char === '"' ? count + 1 : count, 0);
            for (let i = 0, numbers = 0; i < line.length; i++) {
                if (line[i] === '"') {
                    numbers++;
                }
                if (numbers % 2 === 1 && line[i] === '"' && ',' === line[i - 1]) {
                    result += ' "';
                } else {
                    result += line[i];
                }
            }
            return result;
        });
    return resultLines.join('\n');
};


todoFiles.forEach(filePath => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`读取文件 ${filePath} 失败:`, err);
            return;
        }
        // 进行替换
        let modifiedContent = data;
        replacementSymbol.forEach(replacement => {
            const regex = new RegExp(replacement["src"], 'g');
            modifiedContent = modifiedContent.replace(regex, replacement["dst"]);
        });
        replacementNames.forEach(replacement => {
            const regex = new RegExp(replacement["src"], 'g');
            modifiedContent = modifiedContent.replace(regex, replacement["dst"]);
        });
        secondReplacements.forEach(replacement => {
            const regex = new RegExp(replacement["src"], 'g');
            console.log(regex);
            modifiedContent = modifiedContent.replace(regex, replacement["dst"]);
        });
        modifiedContent = thirdReplacement(modifiedContent);
        modifiedContent = fourthReplacement(modifiedContent);
        modifiedContent = fifthReplacement(modifiedContent);
        {
            const regex = new RegExp(' \n', 'g');
            modifiedContent = modifiedContent.replace(regex, '\n');
        }

        // 写回文件
        fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
            if (err) {
                console.error(`写入文件 ${filePath} 失败:`, err);
            } else {
                console.log(`文件 ${filePath} 替换成功`);
            }
        });
    });
});