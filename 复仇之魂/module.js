const path = "/复仇之魂";

const order = {
    begin: 1,
    end: 27,
}
const numToStr = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return num.toString();
    }
}
const generateLink = (chapter) => {
    const chapterNumber1 = numToStr(chapter - 1);
    const chapterNumber2 = numToStr(chapter);
    return {
        text: `Chapter ${chapterNumber1}`,
        link: `${path}/src/chapter${chapterNumber2}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH29复仇之魂.txt`;

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
    const chapterNumber = numToStr(chapter - 1);
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

    resource,
    IsChapterBegin,
    head,
    generatePattern
}