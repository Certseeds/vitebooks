const path = "/军团";

const order = {
    begin: 1,
    end: 27,
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

const resource = `.${path}/HH07军团.txt`;

const IsChapterBegin = (line) => {
    if (0 == line.length || 6 < line.length) {
        return false;
    }
    const chs = new Set(["0", "I", "V", "X", "尾", "声"]);
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