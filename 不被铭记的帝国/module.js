const path = "/不被铭记的帝国";
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
    end: 25,
}
const prelink = `${path}/base`;
const pattern = ["src", 'chapter%02d.md'];

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH27.txt`;

const IsChapterBegin = function (line) {
    const singleDigitRegex = /^\d{1,2}$/;
    return singleDigitRegex.test(line);
}
const head = function (chapter) {
    const chapterNumber = chapter.toString().padStart(2, '0');
    return `# chapter${chapterNumber}}`
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