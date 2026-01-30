import { searchSkills, routeSkill, listCategories, getIndex } from '../src/router.js';

console.log('=== Skill Router Test ===\n');

console.log('1. Building index...');
const index = getIndex();
console.log(`   Found ${Object.keys(index.skills).length} skills`);
console.log(`   Categories: ${Object.keys(index.categories).join(', ')}`);
console.log(`   Keywords indexed: ${Object.keys(index.keywords).length}\n`);

console.log('2. Testing search_skills("debug issue")...');
const debugResults = searchSkills('debug issue', { limit: 3 });
for (const r of debugResults) {
  console.log(`   ${r.id} (score: ${r.score})`);
}
console.log('');

console.log('3. Testing search_skills("create new feature")...');
const featureResults = searchSkills('create new feature', { limit: 3 });
for (const r of featureResults) {
  console.log(`   ${r.id} (score: ${r.score})`);
}
console.log('');

console.log('4. Testing route_skill("fix a failing test")...');
const routeResult = routeSkill('fix a failing test');
if (routeResult) {
  console.log(`   Best match: ${routeResult.skill.id}`);
  console.log(`   Confidence: ${Math.round(routeResult.confidence * 100)}%`);
  console.log(`   Command: ${routeResult.command}`);
} else {
  console.log('   No match found');
}
console.log('');

console.log('5. Testing list_categories()...');
const categories = listCategories();
for (const cat of categories) {
  console.log(`   ${cat.category}: ${cat.count} skills`);
}
console.log('');

console.log('6. Testing search with category filter...');
const processSkills = searchSkills('start work', { category: 'process', limit: 3 });
console.log(`   Found ${processSkills.length} skills in "process" category`);
for (const r of processSkills) {
  console.log(`   ${r.id} (score: ${r.score})`);
}

console.log('\n=== Test Complete ===');
