// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
import { text } from "stream/consumers";

const path = "/塔兰/塔兰-铁甲";

const order = {
    begin: 1,
    end: 30,
}
const numToStr = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return num.toString();
    }
}
const generateLink = (chapter) => {
    const chapterOriginNum = numToStr(chapter);
    const chapterNumber = numToStr(Math.floor(chapter / 2));
    if (chapter % 2 === 0) {
        return {
            text: `塔兰-铁甲-第${chapterNumber}章`,
            link: `${path}/src/chapter${chapterOriginNum}.md`
        };
    } return {
        text: `塔兰-铁甲-第${chapterNumber}间章`,
        link: `${path}/src/chapter${chapterOriginNum}.md`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`, `.${path}/../base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH45塔兰-铁甲.txt`;

const IsChapterBegin = (line) => {
    if (0 == line.length || 6 < line.length) {
        return false;
    }
    if (line.startsWith("第") && line.endsWith("章")) {
        return true;
    } else if (line == "间章") {
        return true;
    }
    const chs = new Set(["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]);
    if (1 == line.length && chs.has(line[0])) {
        return true;
    }
    return false;
}

const head = (chapter) => {
    if (chapter % 2 === 0) {
        return `# 塔兰-铁甲-第${numToStr(Math.floor(chapter / 2))}章`
    }
    return `# 塔兰-铁甲-第${numToStr(Math.floor(chapter / 2))}间章`
}
const generatePattern = (chapter) => {
    const chapterNumber = numToStr(chapter);
    return ["src", `chapter${chapterNumber}.md`];
}

export {
    order,
    generateLink,
    prelink,

    replaceDirs,
    repalceFiles,
    repalceNameFiles,

    resource,
    IsChapterBegin,
    head,
    generatePattern
}