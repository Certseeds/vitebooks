const path = "/黑暗时代/钢铁本质";

const replaceDirs = [];
const repalceFiles = [`.${path}/src.md`,];
const repalceNameFiles = [`.${path}/names.txt`,];


module.exports = {
    generateLink: generateLink,
    order: order,
    prelink: prelink,
    pattern: pattern,

    replaceDirs: replaceDirs,
    repalceFiles: repalceFiles,
    repalceNameFiles: repalceNameFiles
}