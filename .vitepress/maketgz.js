#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';
import { exec } from 'child_process';

const fsPromises = fs.promises;

const isChinese = (str) => /[\u4e00-\u9fa5]/.test(str);

const args = process.argv.slice(2);
console.log(args);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const findMetaFiles = async (dir, tgz) => {
    const files = await fsPromises.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fsPromises.stat(fullPath);
        if (stat.isDirectory() && (isChinese(file) || file === 'welldone')) {
            await findMetaFiles(fullPath, tgz);
        } else if (file === 'meta.toml') {
            console.log(dir, fullPath);
            const content = await fsPromises.readFile(fullPath);
            // console.log(content.toString());
            tgz.append(Buffer.from(content, "utf8"), { name: fullPath });
            break;
        }
    }
};
const toepub = async (dir) => {
    const files = await fsPromises.readdir(dir);
    const firstArg = args[0];
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fsPromises.stat(fullPath);
        if (stat.isDirectory() && isChinese(file)) {
            console.log(`this is fullPath ${fullPath}`);
            const exePath = path.resolve(__dirname, 'toepub.exe');
            exec(`${exePath} --path=./${fullPath} --run-number=${firstArg}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing toepub.exe: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
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
    await toepub(".");
};

scanAndZip().catch(err => console.error(err));