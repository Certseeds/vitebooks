// SPDX-FileCopyrightText: 2024-2026 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later
import { execSync } from 'node:child_process';
import { resolve, normalize } from 'node:path';

/**
 * Build-time singleton: one git log call for the whole repo, parsed into a
 * Map<normalizedAbsPath, Date>.  Every subsequent lookup is O(1).
 *
 * git log format: each commit block looks like
 *   TIMESTAMP:<ISO8601 date>
 *   <blank line>
 *   path/to/file
 *   another/file
 *   <blank line>
 */
function buildGitTimestampCache(): Map<string, Date> {
    const cache = new Map<string, Date>();
    try {
        // -c core.quotepath=false: force git to output UTF-8 paths as-is instead of
        // octal-escaping non-ASCII characters (e.g. Chinese filenames on Windows)
        const raw = execSync(
            'git -c core.quotepath=false log --pretty=format:TIMESTAMP:%cI --name-only',
            { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }
        );
        const root = resolve('.');
        let currentDate: Date | null = null;
        for (const rawLine of raw.split('\n')) {
            // strip Windows CRLF leftovers
            const line = rawLine.replace(/\r$/, '');
            if (line.startsWith('TIMESTAMP:')) {
                currentDate = new Date(line.slice('TIMESTAMP:'.length).trim());
            } else if (line.trim() === '') {
                // blank separator line — keep currentDate, just skip
            } else if (currentDate !== null) {
                // normalize to OS separator so lookup keys always match
                const abs = normalize(resolve(root, line));
                if (!cache.has(abs)) {
                    cache.set(abs, currentDate);
                }
            }
        }
    } catch (err) {
        // git unavailable or not a git repo — cache stays empty
        // (silently skip so static builds outside git still work)
    }
    return cache;
}

// Evaluated once at module import time during the Astro build
const _cache: Map<string, Date> = buildGitTimestampCache();

/**
 * O(1) lookup — no subprocess overhead per page.
 * Accepts any absolute path; normalizes separators before lookup.
 */
export function getGitLastModified(filePath: string): Date | null {
    const key = normalize(resolve(filePath));
    return _cache.get(key) ?? null;
}

/** Number of entries loaded (useful for diagnosing empty-cache issues). */
export const gitCacheSize = _cache.size;

const lastUpdatedFormatOptions: Intl.DateTimeFormatOptions = {
    era: 'short',
    year: 'numeric',
    month: 'long',
    weekday: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'longGeneric',
    fractionalSecondDigits: 3,
    formatMatcher: 'basic',
} as Intl.DateTimeFormatOptions;

export function formatLastModified(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN-u-ca-gregory', lastUpdatedFormatOptions).format(date);
}
