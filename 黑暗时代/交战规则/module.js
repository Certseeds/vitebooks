const path = "/黑暗时代/交战规则";

const order = {
    begin: 1,
    end: 5,
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
        text: `黑暗时代-交战规则-Chapter ${chapterNumber}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

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

const head = (chapter) => {
    const chapterNumber = numToStr(chapter);
    return `# 黑暗时代-交战规则-chapter${chapterNumber}`
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