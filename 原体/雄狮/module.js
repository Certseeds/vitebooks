const path = "/原体/雄狮";
const order = {
    begin: 1,
    end: 9,
}
const numToStr = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return chapter.toString();
    }
}
const generateLink = (chapter) => {
    const chapterNumber = chapter;
    return {
        text: `Chapter ${chapterNumber}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH20雄狮.txt`;

const IsChapterBegin = function (line) {
    if (0 == line.length) {
        return false;
    }
    const trimline = line.trim();
    const chars = ['I', 'V', 'X'];
    for (const char of trimline){
        if (!chars.includes(char)){
            return false;
        }
    }
    return true;
}
const head = (chapter) => {
    const chapterNumber = chapter;
    return `# 原体-雄狮-正文-chapter${chapterNumber}`
}
const generatePattern = (chapter) => {
    const chapterNumber = chapter;
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