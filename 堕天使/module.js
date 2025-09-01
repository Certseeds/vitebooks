// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
const path = "/堕天使";

const order = {
    begin: 1,
    end: 22,
}
const numToStr = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return num.toString();
    }
}
const generateLink = (chapter) => {
    const chapterNumber1 = numToStr(chapter - 1);
    const chapterNumber = numToStr(chapter);
    return {
        text: `Chapter ${chapterNumber1}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH11堕天使.txt`;

const IsChapterBegin = (line) => {
    if (0 == line.length || 6 < line.length) {
        return false;
    }
    const chs = new Set(["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]);
    for (const ch of line) {
        if (!chs.has(ch)) {
            return false;
        }
    }
    return true;
}

const head = (chapter) => {
    const chapterNumber = numToStr(chapter - 1);
    return `# chapter-${chapterNumber}`
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