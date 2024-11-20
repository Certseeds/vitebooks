const path = "/黑暗时代/野蛮武器";

const order = {
    begin: 1,
    end: 19,
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
        text: `黑暗时代-野蛮武器-Chapter ${chapterNumber}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH16野蛮武器.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length) {
        return false;
    }
    const chars = ['I', 'V', 'X'];
    for (const char of line){
        if (!chars.includes(char)){
            return false;
        }
    }
    return true;
}

const head = (chapter) => {
    const chapterNumber = numToStr(chapter);
    return `# 黑暗时代-野蛮武器-chapter${chapterNumber}`
}
const generatePattern = (chapter) => {
    const chapterNumber = numToStr(chapter);
    return ["src", `chapter${chapterNumber}.md`];
}

module.exports = {
    order: order,
    generateLink: generateLink,
    prelink: prelink,

    replaceDirs: replaceDirs,
    repalceFiles: repalceFiles,
    repalceNameFiles: repalceNameFiles,

    resource: resource,
    IsChapterBegin: IsChapterBegin,
    head: head,
    generatePattern: generatePattern
}