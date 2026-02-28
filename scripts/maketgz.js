#!/usr/bin/env node
// SPDX-FileCopyrightText: 2024-2025 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { create } from 'tar';
import { exec } from 'child_process';
import { domainName } from './domain.js';

const isChinese = (str) => /[\u4e00-\u9fa5]/.test(str);

const args = process.argv.slice(2);
console.log(args);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const findMetaFiles = async (dir, filePaths) => {
    const files = await fsp.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fsp.stat(fullPath);
        if (stat.isDirectory() && (isChinese(file) || file === 'welldone')) {
            await findMetaFiles(fullPath, filePaths);
        } else if (file === 'meta.toml') {
            console.log(dir, fullPath);
            filePaths.push(fullPath);
            break;
        }
    }
};

const toepub = async (dir) => {
    const files = await fsp.readdir(dir);
    const firstArg = args[0];
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fsp.stat(fullPath);
        if (stat.isDirectory() && isChinese(file)) {
            console.log(`this is fullPath ${fullPath}`);
            const exePath = path.resolve(__dirname, 'toepub.exe');
            exec(`${exePath} --path=./${fullPath} \
                --publish=${domainName()} \
                --ppath=./warhammer40k \
                --run-number=${firstArg}`, (error, stdout, stderr) => {
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
    const filePaths = [];
    await findMetaFiles('.', filePaths);
    await create(
        {
            gzip: { level: 9 },
            file: './public/meta.tgz',
            portable: true,
            strict: true
        },
        filePaths
    );
    await toepub('.');
};

scanAndZip().catch(err => console.error(err));