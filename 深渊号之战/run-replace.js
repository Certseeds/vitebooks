#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 定义要读取的文件路径模式
const filePattern = path.join(__dirname, 'src', 'chapter%02d.md');

// 定义替换规则
const replacements = [
    { src: '“', dst: '"' },
    { src: '”', dst: '"' },
    { src: '。', dst: '. ' },
    { src: '，', dst: ', ' },
    { src: '？', dst: '? ' },
    { src: '（', dst: '(' },
    { src: '）', dst: ')' },
    { src: '：', dst: ': ' },
    { src: ':', dst: ': ' },
    { src: '！', dst: '! ' },
    { src: '；', dst: '; ' },
    { src: '‘', dst: '\'' },
    { src: '’', dst: '\'' },
    { src: ' ', dst: ' ' },
    { src: '罗保特', dst: '罗伯特' },
    { src: '古里曼', dst: '基里曼' },
    { src: '荷露斯', dst: '荷鲁斯' },
    { src: '马格纳斯', dst: '马格努斯' },
    { src: '弗格瑞姆', dst: '福格瑞姆' },
    { src: '莫塔瑞恩', dst: '莫塔里安' },
    { src: '科尔兹', dst: '科兹' },
    { src: '沃坎', dst: '伏尔甘' },
    { src: '曼努斯', dst: '马努斯' },
    { src: '佩特拉波', dst: '佩图拉博' },
    { src: '洛加', dst: '洛迦' },
    { src: '洛迦尔', dst: '洛迦' },
    { src: '阿兹卡隆', dst: '阿兹凯隆' },
    { src: '基利曼', dst: '基里曼' },
    { src: '洛嘉', dst: '洛迦' },
    { src: '厄瑞巴斯', dst: '艾瑞巴斯' },
    { src: 'KELBOR-HAL', dst: '卡尔博 哈尔' },
    { src: 'Kelbor Hal', dst: '卡尔博 哈尔' }
    { src: 'GUREOD', dst: '古雷奥' },
    { src: '愤怒深渊', dst: '深渊狂怒' },
    { src: '暴怒深渊', dst: '深渊狂怒' },
    { src: '伪帝去死', dst: '诛灭伪帝' },
    { src: '狂暴深渊', dst: '深渊狂怒' },
    { src: '奥特拉马', dst: '奥特拉玛' },
    { src: '卡尔斯', dst: '考斯' },
    { src: '布林那', dst: '布林加' },
    { src: '科尔·费伦', dst: '科尔·法伦' },
    { src: '科尔·斐伦', dst: '科尔·法伦' },
    { src: '卡米斯卡', dst: '卡敏斯卡' },
    { src: '马尔卡多', dst: '马卡多' },
    { src: '卡明斯卡', dst: '卡敏斯卡' },
    { src: '评级机构', dst: '评级机仆' },
    { src: '攻击巡洋舰', dst: '打击巡洋舰' },
    { src: '以太', dst: '亚空间' },
    { src: '异教徒', dst: '异端' },
    { src: '异星人', dst: '异形' },
    { src: '卖国贼', dst: '叛徒'},
    // 添加更多替换规则
];
// 定义第二遍替换规则
const secondReplacements = [
    { src: ', "', dst: ',"' },
    { src: '. "', dst: '."' },
    { src: '! "', dst: '!"' },
    { src: '.  ', dst: '. ' },
    // 添加更多替换规则
];
const order = {
    "begin": 1,
    "end": 21
}
// 读取文件内容并进行替换
for (let i = order["begin"]; i <= order["end"]; i++) {
    const filePath = filePattern.replace('%02d', i.toString().padStart(2, '0'));    // 读取文件内容
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`读取文件 ${filePath} 失败:`, err);
            return;
        }

        // 进行替换
        let modifiedContent = data;
        replacements.forEach(replacement => {
            const regex = new RegExp(replacement["src"], 'g');
            modifiedContent = modifiedContent.replace(regex, replacement["dst"]);
        });
        secondReplacements.forEach(replacement => {
            const regex = new RegExp(replacement["src"], 'g');
            modifiedContent = modifiedContent.replace(regex, replacement["dst"]);
        });

        // 写回文件
        fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
            if (err) {
                console.error(`写入文件 ${filePath} 失败:`, err);
            } else {
                console.log(`文件 ${filePath} 替换成功`);
            }
        });
    });
}