import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';

const sourceRoot = path.join(process.cwd(), 'public/open-source/crazy-chess/android-0.9.0-1');
const expectedSha = '0a258ba7e511cc05755ddf46feb7f384b635574e8fb145037c4b5e7b3dbe250c';

describe('Crazy Chess Android corresponding source', () => {
  it('keeps the archive, page, and manifest checksum aligned', () => {
    const archive = readFileSync(path.join(sourceRoot, 'crazy-chess-android-0.9.0-1-corresponding-source.tar.gz'));
    const archiveSha = createHash('sha256').update(archive).digest('hex');
    const manifest = JSON.parse(readFileSync(path.join(sourceRoot, 'manifest.json'), 'utf8'));
    const index = readFileSync(path.join(sourceRoot, 'index.html'), 'utf8');

    expect(archiveSha).toBe(expectedSha);
    expect(manifest.mobile.correspondingSource.archiveSha256).toBe(expectedSha);
    expect(index).toContain(expectedSha);
  });

  it('does not claim the staged package is already published', () => {
    const manifest = readFileSync(path.join(sourceRoot, 'manifest.json'), 'utf8');
    expect(manifest).not.toMatch(/snapshot-published|"status"\s*:\s*"published"/i);
  });

  it('keeps the signup table private in the tracked migration', () => {
    const migration = readFileSync(path.join(process.cwd(), 'supabase/migrations/20260826000003_add_playtest_signups.sql'), 'utf8');
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(migration).toMatch(/REVOKE ALL ON TABLE playtest_signups FROM anon, authenticated/);
    expect(migration).not.toMatch(/CREATE POLICY/);
  });
});
