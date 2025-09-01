// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
const path = "/人类之主";

const order = {
    begin: 1,
    end: 26,
}
const numToStr = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return num.toString();
    }
}
const generateLink = (chapter) => {
    const chapterNumber1 = numToStr(chapter-1);
    const chapterNumber2 = numToStr(chapter);
    return {
        text: `Chapter ${chapterNumber1}`,
        link: `${path}/src/chapter${chapterNumber2}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH41人类之主.txt`;

const IsChapterBegin = (line) => {
    if (0 == line.length || 4 < line.length) {
        return false;
    }
    const chs = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    for (const ch of line) {
        if (!chs.has(ch)) {
            return false;
        }
    }
    return true;
}

const head = (chapter) => {
    const chapterNumber1 = numToStr(chapter-1);
    return `# chapter-${chapterNumber1}`
}
const generatePattern = (chapter) => {
    const chapterNumber1 = numToStr(chapter-1);
    return ["src", `chapter${chapterNumber1}.md`];
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