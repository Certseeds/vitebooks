const path = "/科拉克斯/暗鸦之主";

const order = {
    begin: 1,
    end: 17,
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

const resource = `.${path}/HH40暗鸦之主.txt`;

const IsChapterBegin = (line) => {
    const divides = new Set([
        "序章",
        "尾声 卡兰迪鲁",
        "战斗驳船复仇者号",
        "斯卡托星系",
        "卡佩尔-5642A",
        "克雷舍拉赫航道",
        "卡兰迪鲁"
    ])
    const trimmedLine = line.trim();
    return divides.has(trimmedLine);
}

const head = (chapter) => {
    const chapterNumber = numToStr(chapter - 1);
    return `# 科拉克斯 暗鸦之主-chapter-${chapterNumber}`
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