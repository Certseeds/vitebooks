const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

const isChinese = (str) => /[\u4e00-\u9fa5]/.test(str);

const findMetaFiles = async (dir, tgz) => {
    const files = await fsPromises.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fsPromises.stat(fullPath);
        if (stat.isDirectory() && isChinese(file)) {
            await findMetaFiles(fullPath, tgz);
        } else if (file === 'meta.toml') {
            console.log(dir, fullPath);
            const content = await fsPromises.readFile(fullPath);
            // console.log(content.toString());
            tgz.append(Buffer.from(content, "utf8"), {name: fullPath});
            break;
        }
    }
};

const scanAndZip = async () => {
    const output = fs.createWriteStream('./public/meta.tgz');
    const tgz = archiver('tar', {
        gzip: true,
        zlib: { level: 9 }
    });
    tgz.pipe(output);
    await findMetaFiles(".", tgz);
    tgz.finalize();
};

scanAndZip().catch(err => console.error(err));