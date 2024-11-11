const path = "/黑暗时代/骗子的下场";
// 生成链接的函数
const generateLink = function (chapter) {
    const chapterNumber = chapter.toString().padStart(2, '0');
    return {
        text: `黑暗时代-骗子的下场-Chapter ${chapterNumber}`,
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

const resource = `.${path}/HH16骗子的下场.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length) {
        return false;
    }
    const trimline = line.trim();
    return trimline.startsWith('+++') && trimline.endsWith('+++');
}

const head = function (chapter) {
    const chapterIn = chapter;
    const chapterNumber = chapterIn.toString().padStart(2, '0');
    return `# 黑暗时代-骗子的下场-chapter${chapterNumber}`
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