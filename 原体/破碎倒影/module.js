const path = "/原体/破碎倒影";
// 生成链接的函数

const order = {
    begin: 1,
    end: 14,
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

const resource = `.${path}/HH20破碎倒影.txt`;

const IsChapterBegin = (line) => {
    const singleDigitRegex = /^\d{1,2}$/;
    return singleDigitRegex.test(line);
}
const head = (chapter) => {
    const chapterNumber = numToStr(chapter);
    return `# 原体-破碎倒影-正文-chapter${chapterNumber}`
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