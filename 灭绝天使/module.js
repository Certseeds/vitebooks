const path = "/灭绝天使";

const order = {
    begin: 1,
    end: 32,
}
const numToStrOrder = (num) => {
    if (order.end >= 10) {
        return num.toString().padStart(2, '0');
    } else if (order.end < 10) {
        return num.toString();
    }
}

const numToStrName = (num) => {
    if (20 < num && num <= 32) {
        num -= 3;
        return numToStrOrder(num);
    }
    if (10 < num  && num <= 19) {
        num -= 2;
        return numToStrOrder(num);

    }
    if (num <= 9) {
        num -= 1;
        return numToStrOrder(num);

    }
    return numToStrOrder(num);
}

const generateLink = (chapter) => {
    const chapterNumber = numToStrOrder(chapter);
    const chapterName = numToStrName(chapter);
    return {
        text: `Chapter ${chapterName}`,
        link: `${path}/src/chapter${chapterNumber}`
    };
}
const prelink = `${path}/base`;

const replaceDirs = [`.${path}/src`,];
const repalceFiles = [`.${path}/base.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];

const resource = `.${path}/HH23灭绝天使.txt`;

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
    const chapterNumber = numToStrOrder(chapter);
    return `# chapter-${chapterNumber}`
}
const generatePattern = (chapter) => {
    const chapterNumber = numToStrOrder(chapter);
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