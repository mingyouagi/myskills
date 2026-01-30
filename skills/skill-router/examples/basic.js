import { searchSkills, routeSkill, startWatching } from '../src/index.js';

console.log('=== Skill Router Basic Usage ===\n');

console.log('1. Search for skills:');
const searchResults = searchSkills('debug issue', { limit: 3 });
console.log(`   Found ${searchResults.length} skills:`);
searchResults.forEach((s, i) => {
  console.log(`   ${i + 1}. ${s.id} (score: ${s.score})`);
});
console.log('');

console.log('2. Route to best skill:');
const route = routeSkill('fix a failing test');
if (route) {
  console.log(`   Best match: ${route.skill.id}`);
  console.log(`   Confidence: ${Math.round(route.confidence * 100)}%`);
  console.log(`   Command: ${route.command}`);
} else {
  console.log('   No matching skill found');
}
console.log('');

console.log('3. Auto-watch for changes (optional):');
console.log('   startWatching({');
console.log('     enableFileWatch: true,');
console.log('     onChange: (changes) => console.log("Skills changed:", changes)');
console.log('   });');
console.log('');

console.log('For more examples, see README.md');
