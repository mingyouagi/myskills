export {
  searchSkills,
  routeSkill,
  listCategories,
  getSkillDetails,
  getIndex,
  invalidateCache,
  startWatching,
  stopWatching,
  getIndexVersion
} from './router.js';

export {
  buildSkillIndex,
  extractFrontmatter,
  extractKeywords,
  findSkillFiles
} from './indexer.js';

export {
  SkillWatcher,
  createWatcher
} from './watcher.js';

// Core functions for custom implementations
export {
  scoreSkill,
  searchSkillsWithIndex,
  routeSkillWithIndex,
  listCategoriesFromIndex,
  getSkillDetailsFromIndex
} from './core.js';
