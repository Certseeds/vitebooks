// SPDX-FileCopyrightText: 2024-2026 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

export const hostURL = 'https://vitebooks.certseeds.com';

export const headMeta: [string, Record<string, string>][] = [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh-CN' }],
    ['meta', { property: 'og:title', content: 'ViteBooks | Static Book Site Powered by Astro' }],
    ['meta', { property: 'og:site_name', content: 'ViteBooks' }],
    ['meta', { property: 'og:image', content: `${hostURL}/favicon.ico` }],
    ['meta', { property: 'og:url', content: `${hostURL}` }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { property: 'twitter:title', content: 'ViteBooks | Static Book Site Powered by Astro' }],
    ['meta', { property: 'twitter:image', content: `${hostURL}/favicon.ico` }],
    ['meta', { property: 'twitter:description', content: 'warhammer cn translation collect and reformat' }],
    ['meta', { property: 'keywords', content: 'astro, warhammer, nodejs, llm' }],
    ['meta', { property: 'robots', content: 'index, follow' }],
    ['meta', { property: 'author', content: 'Certseeds' }],
    ['meta', { property: 'copyleft', content: 'CC-BY-NC-SA-4.0' }],
    ['meta', { name: 'license', content: 'CC-BY-NC-SA-4.0' }],
    ['link', { rel: 'license', href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' }],
];
