const path = "/原体/毒蛇之潜";
// 生成链接的函数
const generateLink = function (chapter) {
    const chapterNumber = chapter;
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
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/src.md`;

const IsChapterBegin = function (line) {
    if (0 == line.length) {
        return false;
    }
    const trimline = line.trim();
    const words = ["alpha", "beta", "gamma", "delta", "epsilon", "omega"];
    for (const word of words) {
        if (trimline.toLowerCase() === word) {
            return true;
        }
    }
    return false;
}
const head = function (chapter) {
    const chapterNumber = chapter;
    return `# 原体-毒蛇之潜-正文-chapter${chapterNumber}`
}
const generatePattern = function (chapter) {
    const chapterNumber = chapter;
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