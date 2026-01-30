import { describe, it, expect } from 'vitest';
import { extractKeywords, extractFrontmatter, buildSkillIndex } from '../src/indexer.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('extractKeywords', () => {
  it('extracts words from text', () => {
    const keywords = extractKeywords('debug the failing test');
    expect(keywords).toContain('debug');
    expect(keywords).toContain('failing');
    expect(keywords).toContain('test');
  });

  it('filters out stop words', () => {
    const keywords = extractKeywords('the a an is are');
    expect(keywords.length).toBe(0);
  });

  it('converts to lowercase', () => {
    const keywords = extractKeywords('DEBUG TEST');
    expect(keywords).toContain('debug');
    expect(keywords).toContain('test');
  });

  it('expands synonyms when enabled', () => {
    const keywords = extractKeywords('debug', true);
    expect(keywords).toContain('debug');
    expect(keywords).toContain('bug');
    expect(keywords).toContain('fix');
  });

  it('does not expand synonyms when disabled', () => {
    const keywords = extractKeywords('debug', false);
    expect(keywords).toContain('debug');
    expect(keywords).not.toContain('bug');
  });

  it('filters short words', () => {
    const keywords = extractKeywords('a ab abc abcd');
    expect(keywords).not.toContain('a');
    expect(keywords).not.toContain('ab');
    expect(keywords).toContain('abc');
    expect(keywords).toContain('abcd');
  });

  it('extracts CJK keywords', () => {
    const keywords = extractKeywords('调试 失败 测试');
    expect(keywords).toContain('调试');
    expect(keywords).toContain('失败');
    expect(keywords).toContain('测试');
  });
});

describe('extractFrontmatter', () => {
  const testDir = path.join(os.tmpdir(), 'skill-router-test-frontmatter');
  const testFile = path.join(testDir, 'test-skill.md');

  it('extracts name and description from frontmatter', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(testFile, `---
name: test-skill
description: A test skill for testing
---

# Content
`);

    const metadata = extractFrontmatter(testFile);
    expect(metadata.name).toBe('test-skill');
    expect(metadata.description).toBe('A test skill for testing');

    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('extracts triggers as array', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(testFile, `---
name: test
triggers: [debug, test, fix]
---
`);

    const metadata = extractFrontmatter(testFile);
    expect(metadata.triggers).toEqual(['debug', 'test', 'fix']);

    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('returns empty object for file without frontmatter', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(testFile, '# Just content\n\nNo frontmatter here.');

    const metadata = extractFrontmatter(testFile);
    expect(metadata).toEqual({});

    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('returns empty object for non-existent file', () => {
    const metadata = extractFrontmatter('/nonexistent/path/file.md');
    expect(metadata).toEqual({});
  });

  it('strips quotes from values', () => {
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(testFile, `---
name: "quoted-name"
description: 'single-quoted'
---
`);

    const metadata = extractFrontmatter(testFile);
    expect(metadata.name).toBe('quoted-name');
    expect(metadata.description).toBe('single-quoted');

    fs.rmSync(testDir, { recursive: true, force: true });
  });
});

describe('buildSkillIndex', () => {
  const testDir = path.join(os.tmpdir(), 'skill-router-test-index');

  it('builds index from skill directories', () => {
    const skillDir = path.join(testDir, 'test-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: test-skill
description: A test skill
category: test
---
`);

    const index = buildSkillIndex([{ basePath: testDir, namespace: 'test' }]);

    expect(index.skills['test:test-skill']).toBeDefined();
    expect(index.skills['test:test-skill'].name).toBe('test-skill');
    expect(index.categories['test']).toContain('test:test-skill');

    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('handles empty directory', () => {
    fs.mkdirSync(testDir, { recursive: true });

    const index = buildSkillIndex([{ basePath: testDir, namespace: 'empty' }]);

    expect(Object.keys(index.skills).length).toBe(0);

    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('infers category when not specified', () => {
    const skillDir = path.join(testDir, 'debugging-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: debugging-skill
description: Use for debugging issues
---
`);

    const index = buildSkillIndex([{ basePath: testDir, namespace: 'test' }]);

    expect(index.skills['test:debugging-skill'].category).toBe('technique');

    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('builds keyword index', () => {
    const skillDir = path.join(testDir, 'keyword-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: keyword-skill
description: Debug and test things
triggers: [debug, test]
---
`);

    const index = buildSkillIndex([{ basePath: testDir, namespace: 'test' }]);

    expect(index.keywords['debug']).toContain('test:keyword-skill');
    expect(index.keywords['test']).toContain('test:keyword-skill');

    fs.rmSync(testDir, { recursive: true, force: true });
  });
});
