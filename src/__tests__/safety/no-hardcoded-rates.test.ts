/**
 * CRITICAL safety test — no hardcoded dollar amounts in source files.
 *
 * This test scans every .ts and .tsx file under src/ and asserts that none
 * contain patterns like $23.23, $48,000, $25.27 etc.
 *
 * WHY THIS MATTERS:
 *  1. Award rates are reviewed annually by the Fair Work Commission.
 *  2. Different modern awards carry different base rates and penalty multipliers.
 *  3. A hardcoded rate in generated documents or API responses constitutes a
 *     false legal calculation — creating direct liability for the platform.
 *  4. The system prompt in /api/chat already lists $23.23 (minimum wage floor)
 *     as a reference; that file is explicitly excluded from this scan via the
 *     allowlist below. If that rate must be updated it should live in a single
 *     config constant, not scattered through the codebase.
 *
 * ALLOWLIST: files where a dollar+digit pattern is intentional and reviewed:
 *  - src/app/api/chat/route.ts   — system prompt references NMW for education
 *  - src/__tests__/**            — test files themselves (e.g. this comment)
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------- config ----------

const SRC_ROOT = path.join(process.cwd(), 'src');

/**
 * Relative paths (from project root) that are explicitly allowed to contain
 * dollar+digit patterns. Each entry must have a documented reason.
 */
const ALLOWLIST: ReadonlySet<string> = new Set([
  // System prompt legitimately references the National Minimum Wage floor as
  // a reference point for triage. Reviewed and intentional.
  'src/app/api/chat/route.ts',
]);

// Dollar sign immediately followed by one or more digits (with optional
// commas and decimals): matches $23.23, $48,000, $1200 but not $priceId
const HARDCODED_RATE_PATTERN = /\$\d[\d,.]*\b/g;

// ---------- helpers ----------

function walkSync(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkSync(full));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function projectRelative(absPath: string): string {
  return path.relative(process.cwd(), absPath);
}

function isTestFile(relPath: string): boolean {
  return relPath.includes('__tests__');
}

// ---------- tests ----------

describe('No hardcoded dollar amounts in source (safety gate)', () => {
  const allSourceFiles = walkSync(SRC_ROOT);

  // Partition: files to scan vs files we skip
  const filesToScan = allSourceFiles.filter((f) => {
    const rel = projectRelative(f);
    return !isTestFile(rel) && !ALLOWLIST.has(rel);
  });

  it('finds at least some source files to scan (sanity check)', () => {
    expect(filesToScan.length).toBeGreaterThan(0);
  });

  it('has no hardcoded dollar amounts outside the allowlist', () => {
    const violations: Array<{ file: string; matches: string[] }> = [];

    for (const absPath of filesToScan) {
      const source = fs.readFileSync(absPath, 'utf-8');
      const matches = source.match(HARDCODED_RATE_PATTERN);
      if (matches) {
        violations.push({ file: projectRelative(absPath), matches });
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map(
          (v) =>
            `  ${v.file}\n    Found: ${v.matches.join(', ')}\n`,
        )
        .join('\n');

      throw new Error(
        `HARDCODED DOLLAR AMOUNTS FOUND — this is a legal liability.\n\n` +
          `Award rates change annually. Hardcoded amounts in generated documents\n` +
          `or responses are false legal calculations. Remove them.\n\n` +
          `Violations:\n${report}\n` +
          `If a rate is intentional (e.g. a reference constant), add it to ALLOWLIST\n` +
          `in src/__tests__/safety/no-hardcoded-rates.test.ts with a documented reason.`,
      );
    }

    expect(violations).toHaveLength(0);
  });

  // Individual file tests — makes it easy to see which file failed in CI output
  for (const absPath of filesToScan) {
    const rel = projectRelative(absPath);
    it(`${rel} contains no hardcoded dollar amounts`, () => {
      const source = fs.readFileSync(absPath, 'utf-8');
      const matches = source.match(HARDCODED_RATE_PATTERN);
      expect(matches).toBeNull();
    });
  }
});
