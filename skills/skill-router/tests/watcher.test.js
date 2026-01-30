import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkillWatcher, createWatcher } from '../src/watcher.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('SkillWatcher', () => {
  let testDir;
  let watcher;

  beforeEach(() => {
    testDir = path.join(os.tmpdir(), `skill-watcher-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (watcher) {
      watcher.stop();
      watcher = null;
    }
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('creates watcher with default options', () => {
    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }]);
    expect(watcher).toBeInstanceOf(SkillWatcher);
    expect(watcher.options.enableFileWatch).toBe(true);
    expect(watcher.options.enableGitCheck).toBe(false);
  });

  it('creates watcher with custom options', () => {
    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }], {
      pollInterval: 10000,
      enableFileWatch: false,
      debounceMs: 1000
    });
    expect(watcher.options.pollInterval).toBe(10000);
    expect(watcher.options.enableFileWatch).toBe(false);
    expect(watcher.options.debounceMs).toBe(1000);
  });

  it('detects new skill added', () => {
    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }], {
      enableFileWatch: false
    });

    const { hasChanges: initialChanges } = watcher.detectChanges();

    const skillDir = path.join(testDir, 'new-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: new-skill
description: A new skill
---
`);

    const { hasChanges, changes } = watcher.detectChanges();

    expect(hasChanges).toBe(true);
    expect(changes.added.length).toBe(1);
    expect(changes.added[0].id).toBe('test:new-skill');
  });

  it('detects skill update', () => {
    const skillDir = path.join(testDir, 'update-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: update-skill
description: Original description
---
`);

    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }], {
      enableFileWatch: false
    });

    watcher.detectChanges();

    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: update-skill
description: Updated description
---
`);

    const { hasChanges, changes } = watcher.detectChanges();

    expect(hasChanges).toBe(true);
    expect(changes.updated.length).toBe(1);
    expect(changes.updated[0].id).toBe('test:update-skill');
  });

  it('detects skill removal', () => {
    const skillDir = path.join(testDir, 'remove-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: remove-skill
description: To be removed
---
`);

    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }], {
      enableFileWatch: false
    });

    watcher.detectChanges();

    fs.rmSync(skillDir, { recursive: true, force: true });

    const { hasChanges, changes } = watcher.detectChanges();

    expect(hasChanges).toBe(true);
    expect(changes.removed.length).toBe(1);
    expect(changes.removed[0].id).toBe('test:remove-skill');
  });

  it('returns no changes when nothing changed', () => {
    const skillDir = path.join(testDir, 'stable-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: stable-skill
description: Stable
---
`);

    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }], {
      enableFileWatch: false
    });

    watcher.detectChanges();
    const { hasChanges } = watcher.detectChanges();

    expect(hasChanges).toBe(false);
  });

  it('forceRefresh clears manifest and detects all as new', () => {
    const skillDir = path.join(testDir, 'force-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: force-skill
description: Force test
---
`);

    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }], {
      enableFileWatch: false
    });

    watcher.detectChanges();

    const { hasChanges, changes } = watcher.forceRefresh();

    expect(hasChanges).toBe(true);
    expect(changes.added.length).toBe(1);
  });

  it('emits change event when skills change', async () => {
    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }], {
      enableFileWatch: false,
      pollInterval: 100
    });

    const changePromise = new Promise((resolve) => {
      watcher.on('change', resolve);
    });

    watcher.start();

    const skillDir = path.join(testDir, 'event-skill');
    fs.mkdirSync(skillDir, { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: event-skill
description: Event test
---
`);

    const changes = await Promise.race([
      changePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
    ]);

    expect(changes.added.length).toBeGreaterThan(0);
  });

  it('stop cleans up resources', () => {
    watcher = createWatcher([{ basePath: testDir, namespace: 'test' }]);
    watcher.start();

    expect(watcher.watchers.length).toBeGreaterThanOrEqual(0);

    watcher.stop();

    expect(watcher.watchers.length).toBe(0);
    expect(watcher.pollTimer).toBeNull();
  });
});
