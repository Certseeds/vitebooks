const path = "/黑暗时代";

const replaceDirs = [
    `.${path}/交战规则/src`,
    `.${path}/骗子的下场/src`,
    `.${path}/被遗忘的子嗣/src`,
    `.${path}/野蛮武器/src`,
];
const repalceFiles = [
    `.${path}/最后的记述者/src.md`,
    `.${path}/重生/src.md`,
    `.${path}/背叛之貌/src.md`,
    `.${path}/小荷鲁斯/src.md`,
    `.${path}/钢铁本质/src.md`,
];
const repalceNameFiles = [`.${path}/names.txt`,];

module.exports = {
    replaceDirs: replaceDirs,
    repalceFiles: repalceFiles,
    repalceNameFiles: repalceNameFiles,
}