const path = "/深渊之战";
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
    end: 21,
}
const prelink = `${path}/base`;
const pattern = ["src", 'chapter%02d.md'];

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH08.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length || 3 < line.length ) {
        return false;
    }
    const numbers = "一二三四五六七八九十".split("");
    for (let char of line) {
        if (!numbers.includes(char)) {
            return false;
        }
    }
    return true;
}

const head = function (chapter) {
    const chapterNumber = chapter.toString().padStart(2, '0');
    return `# chapter-${chapterNumber}`
}
const generatePattern = function (chapter) {
    const chapterNumber = chapter.toString().padStart(2, '0');
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