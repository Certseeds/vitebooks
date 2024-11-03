const path = "/黑暗时代/交战规则";
// 生成链接的函数
const generateLink = function (chapter) {
    const chapterNumber = chapter.toString().padStart(2, '0');
    return {
        text: `黑暗时代-交战规则-Chapter ${chapterNumber}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const order = {
    begin: 1,
    end: 5,
}
const prelink = `${path}/base`;
const pattern = ["src", 'chapter%02d.md'];

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH16交战规则.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length) {
        return false;
    }
    return line.endsWith('号交战记录');
}

const head = function (chapter) {
    const chapterIn = chapter;
    const chapterNumber = chapterIn.toString().padStart(2, '0');
    return `# 黑暗时代-交战规则-chapter${chapterNumber}`
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