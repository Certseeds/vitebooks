const path = "/塔兰/塔兰-处决者";
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
    const dealChapter = Math.floor((chapter + 1) / 2);
    const dealChapterNumber = numToStr(dealChapter);
    const chapterNumber = numToStr(chapter);

    if (chapter % 2 === 1) {
        return {
            text: `第${dealChapterNumber}间章`,
            link: `${path}/src/chapter${chapterNumber}`
        }
    }
    return {
        text: `第${dealChapterNumber}章`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;
const replaceDirs = [`.${path}/src`,];
const repalceFiles = [
    `.${path}/base.md`,
];
const repalceNameFiles = [`.${path}/names.txt`,];

const head = (chapter) => {
    const chapterNumber = numToStr(chapter);
    return `# chapter-${chapterNumber}`
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

    head,
    generatePattern
}