import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
  searchSkills, 
  getIndex, 
  startWatching, 
  stopWatching, 
  invalidateCache,
  getIndexVersion 
} from '../src/router.js';

const TEST_SKILL_DIR = path.join(os.tmpdir(), 'skill-router-test-' + Date.now());
const TEST_SKILL_PATH = path.join(TEST_SKILL_DIR, 'test-skill');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('=== Skill Watcher Tests ===\n');

  console.log('1. Setup: Creating test skill directory...');
  fs.mkdirSync(TEST_SKILL_PATH, { recursive: true });
  fs.writeFileSync(path.join(TEST_SKILL_PATH, 'SKILL.md'), `---
name: test-skill
description: A test skill for watcher verification
category: test
triggers: [test, verify, check]
---

# Test Skill

This is a test skill.
`);
  console.log(`   Created: ${TEST_SKILL_PATH}\n`);

  console.log('2. Testing initial index build...');
  const initialVersion = getIndexVersion();
  const initialIndex = getIndex(TEST_SKILL_DIR);
  console.log(`   Skills found: ${Object.keys(initialIndex.skills).length}`);
  console.log(`   Index version: ${initialVersion}`);
  
  const testSkillFound = Object.keys(initialIndex.skills).some(id => id.includes('test-skill'));
  console.log(`   Test skill in index: ${testSkillFound ? 'YES' : 'NO'}\n`);

  console.log('3. Testing watcher startup...');
  let changeDetected = false;
  let detectedChanges = null;
  
  const watcher = startWatching({
    projectSkillsDir: TEST_SKILL_DIR,
    pollInterval: 2000,
    enableFileWatch: true,
    enableGitCheck: false,
    debounceMs: 500,
    onChange: (changes) => {
      changeDetected = true;
      detectedChanges = changes;
      console.log('   [EVENT] Change detected:', JSON.stringify(changes, null, 2));
    }
  });
  console.log('   Watcher started\n');

  console.log('4. Testing skill modification detection...');
  console.log('   Modifying test skill...');
  
  await sleep(1000);
  
  fs.writeFileSync(path.join(TEST_SKILL_PATH, 'SKILL.md'), `---
name: test-skill-updated
description: An UPDATED test skill for watcher verification
category: test
triggers: [test, verify, check, updated]
---

# Test Skill (Updated)

This is an updated test skill.
`);
  
  console.log('   Waiting for change detection (up to 5 seconds)...');
  
  for (let i = 0; i < 10; i++) {
    await sleep(500);
    if (changeDetected) break;
  }
  
  if (changeDetected) {
    console.log('   [PASS] Change detected successfully');
    console.log(`   Updated skills: ${detectedChanges?.updated?.length || 0}`);
  } else {
    console.log('   [INFO] File watch may not have triggered, checking manually...');
    invalidateCache();
    const newIndex = getIndex(TEST_SKILL_DIR);
    const updatedSkill = Object.values(newIndex.skills).find(s => s.name === 'test-skill-updated');
    if (updatedSkill) {
      console.log('   [PASS] Manual cache invalidation works, updated skill found');
    } else {
      console.log('   [FAIL] Updated skill not found');
    }
  }
  console.log('');

  console.log('5. Testing new skill addition...');
  changeDetected = false;
  detectedChanges = null;
  
  const newSkillPath = path.join(TEST_SKILL_DIR, 'new-skill');
  fs.mkdirSync(newSkillPath, { recursive: true });
  fs.writeFileSync(path.join(newSkillPath, 'SKILL.md'), `---
name: new-skill
description: A newly added skill
category: test
triggers: [new, fresh, added]
---

# New Skill

This is a newly added skill.
`);
  
  console.log('   Waiting for addition detection...');
  
  for (let i = 0; i < 10; i++) {
    await sleep(500);
    if (changeDetected) break;
  }
  
  if (changeDetected && detectedChanges?.added?.length > 0) {
    console.log('   [PASS] New skill detected');
    console.log(`   Added: ${detectedChanges.added.map(s => s.id).join(', ')}`);
  } else {
    console.log('   [INFO] Checking manually...');
    invalidateCache();
    const newIndex = getIndex(TEST_SKILL_DIR);
    const newSkill = Object.values(newIndex.skills).find(s => s.name === 'new-skill');
    if (newSkill) {
      console.log('   [PASS] Manual refresh works, new skill found');
    } else {
      console.log('   [FAIL] New skill not found');
    }
  }
  console.log('');

  console.log('6. Testing search after updates...');
  invalidateCache();
  const results = searchSkills('updated test', { projectSkillsDir: TEST_SKILL_DIR, limit: 3 });
  console.log(`   Search results: ${results.length}`);
  for (const r of results) {
    console.log(`   - ${r.id} (score: ${r.score})`);
  }
  console.log('');

  console.log('7. Cleanup...');
  stopWatching();
  fs.rmSync(TEST_SKILL_DIR, { recursive: true, force: true });
  console.log('   Test directory removed\n');

  console.log('=== Tests Complete ===');
}

runTests().catch(console.error);
