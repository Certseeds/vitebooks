

const path = "/忠诚的负担/狼王";
// 生成链接的函数
const generateLink = function (chapter) {
    const chapterNumber = chapter.toString().padStart(2, '0');
    return {
        text: `Chapter ${chapterNumber}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const order = {
    begin: 1,
    end: 6,
}
const prelink = `${path}/base`;
const pattern = ["src", 'chapter%02d.md'];

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [];
const repalceNameFiles = [];

const resource = `.${path}/HH48-狼王.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length || 3 < line.length) {
        return false;
    }
    const numbers = "零一二三四五六七八九十".split("");
    if (line.startsWith("第") && numbers.includes(line[1]) && line.endsWith("章")) {
        return true;
    }
    return false;
}

const head = function (chapter) {
    const chapterNumber = Number(chapter-1).toString();
    return `# chapter-${chapterNumber}`
}
const generatePattern = function (chapter) {
    const chapterNumber = Number(chapter-1).toString();
    return ["src", `chapter${chapterNumber}.md`];
}

module.exports = {
    generateLink: generateLink,
    order: order,
    prelink: prelink,
    pattern: pattern,

    replaceDirs: replaceDirs,
    repalceFiles: repalceFiles,
    repalceNameFiles: repalceNameFiles,

    resource: resource,
    IsChapterBegin: IsChapterBegin,
    head: head,
    generatePattern: generatePattern
}