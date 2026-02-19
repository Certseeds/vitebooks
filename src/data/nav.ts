// SPDX-FileCopyrightText: 2024-2026 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface NavItem {
    text: string;
    link: string;
    target?: string;
    rel?: string;
}

export const hostURL = 'https://vitebooks.certseeds.com';

export const navItems: NavItem[] = [
    { text: 'Home', link: '/' },
    { text: '无所畏惧', link: '/无所畏惧/meta' },
    { text: 'epub总集', link: '/warhammer40k/epub' },
    { text: 'warhammer40k-元数据', link: '/warhammer40k/primarchs' },
    { text: 'dep-page', link: '/depage/index.html', target: '_blank' },
    { text: 'web-cmp-translate', link: '/web-cmp-trans/index.html', target: '_blank' },
    { text: 'web-turndown', link: '/turndown/index.html', target: '_blank' },
];

export const socialLinks = [
    {
        icon: 'github',
        link: 'https://github.com/Certseeds/vitebooks',
        label: 'GitHub',
    },
];
