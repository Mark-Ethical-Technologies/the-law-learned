/**
 * Smoke tests for the MatterPackDocument PDF module.
 *
 * We verify the TypeScript interface contract and that the document
 * source contains no hardcoded dollar amounts (which would be legal
 * liabilities because award rates change annually).
 *
 * @react-pdf/renderer uses React internals that are incompatible with
 * the Jest/Node environment, so we do NOT attempt to render the PDF.
 * Instead we:
 *  1. Check that the exported MatterPackData interface is structurally
 *     satisfied by a conformant test object (compile-time + runtime).
 *  2. Read the raw source of matter-pack-doc.tsx and assert it contains
 *     no hardcoded monetary amounts like $23.27 or $48,000.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { MatterPackData } from '@/lib/pdf/matter-pack-doc';

// ---------- helper ----------

function readSourceFile(relPath: string): string {
  const abs = path.join(process.cwd(), relPath);
  return fs.readFileSync(abs, 'utf-8');
}

// Matches a dollar sign immediately followed by digits, e.g. $23.23 or $48,000
const HARDCODED_DOLLAR_AMOUNT = /\$\d[\d,.]*/g;

// These strings are acceptable in the PDF doc (legal resource phone numbers,
// page references, etc.) — we only care about rate amounts.
// Actually, let's be strict: the source should contain zero dollar+digit patterns.

// ---------- tests ----------

describe('MatterPackData interface', () => {
  it('is satisfied by a well-formed test object', () => {
    const data: MatterPackData = {
      workerName: 'Jane Smith',
      employer: 'Acme Hospitality Pty Ltd',
      industry: 'Hospitality',
      awardName: 'Hospitality Industry (General) Award MA000009',
      employmentStartDate: '2022-01-10',
      currentStatus: 'Employed',
      account:
        'I have worked at the restaurant since January 2022. I always work Sunday shifts but I receive the same rate as a weekday.',
      issuesSummary: 'Possible non-payment of Sunday penalty rates.',
      nextSteps: 'Seek advice from a qualified practitioner.',
      generatedAt: new Date().toISOString(),
      sessionId: 'test-session-001',
    };

    // All required fields must be present and the right type
    expect(typeof data.workerName).toBe('string');
    expect(typeof data.employer).toBe('string');
    expect(typeof data.industry).toBe('string');
    expect(typeof data.awardName).toBe('string');
    expect(typeof data.account).toBe('string');
    expect(typeof data.issuesSummary).toBe('string');
    expect(typeof data.nextSteps).toBe('string');
    expect(typeof data.generatedAt).toBe('string');
    expect(typeof data.sessionId).toBe('string');
  });

  it('accepts optional fields as undefined', () => {
    const data: MatterPackData = {
      workerName: 'John Doe',
      employer: 'Test Co',
      industry: 'Retail',
      awardName: 'General Retail Industry Award MA000004',
      account: 'Narrative here.',
      issuesSummary: 'Issues summary.',
      nextSteps: 'Next steps.',
      generatedAt: new Date().toISOString(),
      sessionId: 'sess-002',
    };

    // Optional fields should be absent (undefined)
    expect(data.employmentStartDate).toBeUndefined();
    expect(data.currentStatus).toBeUndefined();
  });
});

describe('MatterPackDocument source — no hardcoded dollar amounts', () => {
  const SOURCE_PATH = 'src/lib/pdf/matter-pack-doc.tsx';

  it('source file exists', () => {
    const abs = path.join(process.cwd(), SOURCE_PATH);
    expect(fs.existsSync(abs)).toBe(true);
  });

  it('contains no hardcoded monetary amounts like $23.23 or $48,000', () => {
    const source = readSourceFile(SOURCE_PATH);
    const matches = source.match(HARDCODED_DOLLAR_AMOUNT);

    if (matches) {
      throw new Error(
        `Found hardcoded dollar amounts in ${SOURCE_PATH}: ${matches.join(', ')}\n` +
          'Award rates change annually. Hardcoded rates in documents create false legal evidence.\n' +
          'Remove or replace with dynamic lookups.',
      );
    }

    expect(matches).toBeNull();
  });
});
