const path = "/背叛之影/群鸦王子";

const order = {
    begin: 1,
    end: 11,
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

const resource = `.${path}/HH22群鸦王子.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length || 3 < line.length) {
        return false;
    }
    if (line.endsWith("章")) {
        return true;
    }
    return false;
}

const head = (chapter) => {
    const chapterIn = chapter - 1;
    const chapterNumber = numToStr(chapterIn);
    return `# chapter${chapterNumber}`
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