const path = "/无所畏惧";
// 生成链接的函数
const generateLink = function (chapter, part) {
    const chapterNumber = chapter.toString().padStart(2, '0');
    const partNumber = part.toString().padStart(2, '0');
    return {
        text: `Chapter${chapterNumber}-Part${partNumber}`,
        link: `${path}/chapter${chapterNumber}/part${partNumber}`
    };
}
const order = [8, 3, 3, 9, 3, 6];
const prelink = `${path}/base`;
const pattern = function (chapter, part) {
    const chapterNumber = chapter.toString().padStart(2, '0');
    const partNumber = part.toString().padStart(2, '0');
    return `.${path}/chapter${chapterNumber}/part${partNumber}.md`
}


const replaceDirs = [`.${path}/chapter01`,
`.${path}/chapter02`,
`.${path}/chapter03`,
`.${path}/chapter04`,
`.${path}/chapter05`,
`.${path}/chapter06`
];
const repalceFiles = [];
const repalceNameFiles = [`.${path}/names.txt`,];


const IsChapterBegin = function (line) {
    const singleDigitRegex = /^\d{1,2}$/;
    return singleDigitRegex.test(line);
}
const head = function (chapter, part) {
    const chapterNumber = chapter.toString().padStart(2, '0');
    const partNumber = part.toString().padStart(2, '0');
    return `# chapter${chapterNumber}-part${partNumber}`
}
const resource = `.${path}/HH19.txt`;

export {
    generateLink,
    order,
    prelink,
    pattern: pattern,

    replaceDirs,
    repalceFiles,
    repalceNameFiles,

    IsChapterBegin,
    head,
    resource,
}