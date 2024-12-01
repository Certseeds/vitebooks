const path = "/忠诚的负担/狼王";
// 生成链接的函数
const order = {
    begin: 1,
    end: 6,
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
const repalceNameFiles = [];

const resource = `.${path}/HH48-狼王.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length || 3 < line.length) {
        return false;
    }
    const numbers = "零一二三四五六七八九十".split("");
    if (line.startsWith("第") && numbers.includes(line[1]) && line.endsWith("章")) {
        return true;
    }
    return false;
}

const head = (chapter) => {
    const chapterNumber = numToStr(chapter - 1);
    return `# chapter-${chapterNumber}`
}
const generatePattern = (chapter) => {
    const chapterNumber = numToStr(chapter - 1);
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