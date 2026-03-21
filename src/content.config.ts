// SPDX-FileCopyrightText: 2024-2026 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

/** Directories at workspace root that are definitively NOT book content. */
const NON_BOOK_DIRS = new Set([
    '.git', '.github', '.astro',
    'node_modules', 'src', 'dist', 'public',
    'depage', 'turndown', 'web-cmp-translate',
    'goserver',
]);

const projectRoot = resolve('./');

/** Enumerate only actual book directories (have a meta.md or organize.md). */
const bookDirs = readdirSync(projectRoot).filter((name: string) => {
    if (NON_BOOK_DIRS.has(name)) return false;
    if (name.startsWith('.')) return false;
    try {
        const full = join(projectRoot, name);
        if (!statSync(full).isDirectory()) return false;
        // must contain at least one .md file at root level to be a book dir
        const entries = readdirSync(full);
        return entries.some(e => e.endsWith('.md'));
    } catch {
        return false;
    }
});

// One glob pattern per book dir; `**` covers both root-level and deeply nested files.
const patterns: string[] = bookDirs.map((dir: string) => `${dir}/**/*.md`);

const pageSchema = z.object({
    prev: z.object({
        text: z.string(),
        link: z.string(),
    }).optional(),
    next: z.object({
        text: z.string(),
        link: z.string(),
    }).optional(),
    layout: z.string().optional(),
}).passthrough();

export const collections = {
    books: defineCollection({
        loader: glob({
            pattern: patterns,
            base: './',
        }),
        schema: pageSchema,
    }),
};
