const path = "/流浪弃儿";

const order = {
    begin: 1,
    end: 29,
}
const numToStr = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return num.toString();
    }
}
const generateLink = (chapter) => {
    const chapterNumber1 = numToStr(chapter - 3);
    const chapterNumber2 = numToStr(chapter - 4);
    const chapterNumber3 = numToStr(chapter);
    if (chapter >= 14){
        return {
            text: `Chapter ${chapterNumber2}`,
            link: `${path}/src/chapter${chapterNumber3}`
        };
    }
    return {
        text: `Chapter ${chapterNumber1}`,
        link: `${path}/src/chapter${chapterNumber3}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH17流浪弃儿.txt`;

const IsChapterBegin = (line) => {
    if (0 == line.length || 6 < line.length) {
        return false;
    }
    if (line.startsWith("第") && line.endsWith("章")) {
        return true;
    }
    return false;
}

const head = (chapter) => {
    const chapterNumber = numToStr(chapter - 3);
    return `# chapter ${chapterNumber}`
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