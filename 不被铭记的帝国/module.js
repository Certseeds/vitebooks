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

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [];
const repalceNameFiles = [`.${path}/names.txt`,];

module.exports = {
    generateLink: generateLink,
    prelink: prelink,
    order: order,
    replaceDirs: replaceDirs,
    repalceFiles: repalceFiles,
    repalceNameFiles: repalceNameFiles
}