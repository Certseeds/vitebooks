// SPDX-FileCopyrightText: 2024-2026 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const hostURL = 'https://vitebooks.certseeds.com';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
    site: hostURL,
    output: 'static',
    integrations: [
        sitemap({
            filter: (page) => !page.includes('/node_modules/'),
            // chunked sitemaps: split by first path segment
            serialize(item) {
                return item;
            },
            entryLimit: 200,
        }),
    ],
    markdown: {
        // remark-gfm is enabled by default in Astro, which supports [^1] footnote syntax
        remarkPlugins: [],
        rehypePlugins: [],
        shikiConfig: {
            theme: 'github-light',
        },
    },
    srcDir: './src',
    build: {
        format: 'directory',
        // generate up to 16 pages concurrently — dramatically reduces wall-clock time
        concurrency: 16,
    },
});
