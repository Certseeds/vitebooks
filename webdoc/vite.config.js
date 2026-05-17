// SPDX-FileCopyrightText: 2026 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveCommitHash = () => {
    if (process.env.GITHUB_SHA) {
        return process.env.GITHUB_SHA.trim();
    }
    try {
        return execSync('git rev-parse HEAD', {
            cwd: __dirname,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch (_error) {
        return '';
    }
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: '/webdoc/',
    assetsInclude: ['**/*.wasm'],
    define: {
        __WEBDOC_COMMIT_HASH__: JSON.stringify(resolveCommitHash()),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        target: 'esnext',
    }
});
