const fs = require('fs').promises;
const path = require('path');
var AdmZip = require("adm-zip");

const isChinese = (str) => /[\u4e00-\u9fa5]/.test(str);

const findMetaFiles = async (dir, zip) => {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory() && isChinese(file)) {
            await findMetaFiles(fullPath, zip);
        } else if (file === 'meta.toml') {
            console.log(dir, fullPath);
            const content = await fs.readFile(fullPath);
            // console.log(content.toString());
            zip.addFile(fullPath, Buffer.from(content, "utf8"));
            break;
        }
    }
};

const scanAndZip = async () => {
    const zip = new AdmZip();
    await findMetaFiles(".", zip);
    zip.writeZip("./public/meta.zip");
};

scanAndZip().catch(err => console.error(err));