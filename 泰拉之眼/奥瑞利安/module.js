const path = "/泰拉之眼/奥瑞利安";

const order = {
    begin: 1,
    end: 13,
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
        text: `Chapter ${chapterNumber}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/src.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length) {
        return false;
    }
    const trimline = line.trim();
    const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen"];
    for (const word of words) {
        if (trimline.toLowerCase() === word) {
            return true;
        }
    }
    return false;
}
const head = (chapter) => {
    const chapterNumber = numToStr(chapter);
    return `# 泰拉之眼-奥瑞利安-正文-chapter${chapterNumber}`
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