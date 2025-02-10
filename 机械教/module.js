const path = "/机械教";

const order = {
    begin: 1,
    end: 23,
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
    const chapterNumber = numToStr(chapter);
    return {
        text: `Chapter ${chapterNumber1}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH09机械神教.txt`;

const IsChapterBegin = (line) => {
    if (0 == line.length || 6 < line.length) {
        return false;
    }
    const chs = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    if (chs.has(line[0]) && chs.has(line[3]) && chs.has(line[2]) && line[1] == ".") {
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