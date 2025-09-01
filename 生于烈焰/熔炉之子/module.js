// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
const path = "/生于烈焰/熔炉之子";

const order = {
    begin: 1,
    end: 31,
}
const numToStrOrder = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return num.toString();
    }
}

const numToStrName = (num) => {
    if (num >= 3) {
        num -= 2;
        return numToStrOrder(num);
    }
    return numToStrOrder(num);
}

const generateLink = (chapter) => {
    const chapterNumber = numToStrOrder(chapter);
    const chapterName = numToStrName(chapter);
    return {
        text: `Chapter ${chapterName}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH50-熔炉之子.txt`;

const IsChapterBegin = (line) => {
    if (0 == line.length || 6 < line.length) {
        return false;
    }
    if (line.startsWith("第") && line.endsWith("章")) {
        return true;
    }
    return false;
}

const head = (chapter) => {
    const chapterName = numToStrName(chapter);
    return `# 熔炉之子-chapter-${chapterName}`
}
const generatePattern = (chapter) => {
    const chapterNumber = numToStrOrder(chapter);
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