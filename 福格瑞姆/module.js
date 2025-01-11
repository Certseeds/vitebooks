const path = "/福格瑞姆";

const order = {
    begin: 1,
    end: 25,
}
const numToStr = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return num.toString();
    }
}
const generateLink = (chapter) => {
    const chapterNumber = numToStr(chapter);
    return {
        text: `Chapter ${chapterNumber}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH05福格瑞姆.txt`;

const IsChapterBegin = (line) => {
    if (0 == line.length || 6 < line.length) {
        return false;
    }
    if (line.endsWith("章") && line.startsWith("第")) {
        return true;
    }
    const chs = new Set(["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]);
    for (const ch of line) {
        if (!chs.has(ch)) {
            return false;
        }
    }
    return true;
}

const head = (chapter) => {
    const chapterNumber = numToStr(chapter);
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