import fs from 'fs';
import path from 'path';
import os from 'os';
import * as skillIndex from './indexer.js';
import { createWatcher } from './watcher.js';

const homeDir = os.homedir();

const DEFAULT_SKILL_DIRS = [
  { basePath: path.join(homeDir, '.claude/superpowers/skills'), namespace: 'superpowers' },
  { basePath: path.join(homeDir, '.claude/skills'), namespace: null }
];

let cachedIndex = null;
let indexBuildTime = null;
let indexVersion = 0;
let activeWatcher = null;
const INDEX_TTL_MS = 5 * 60 * 1000;

function invalidateCache() {
  cachedIndex = null;
  indexBuildTime = null;
  indexVersion++;
}

function getIndex(projectSkillsDir = null) {
  const now = Date.now();
  if (cachedIndex && indexBuildTime && (now - indexBuildTime) < INDEX_TTL_MS) {
    return cachedIndex;
  }

  const skillDirs = [...DEFAULT_SKILL_DIRS];
  if (projectSkillsDir && fs.existsSync(projectSkillsDir)) {
    skillDirs.unshift({ basePath: projectSkillsDir, namespace: 'project' });
  }

  cachedIndex = skillIndex.buildSkillIndex(skillDirs);
  cachedIndex.version = indexVersion;
  indexBuildTime = now;
  return cachedIndex;
}

function startWatching(options = {}) {
  if (activeWatcher) {
    return activeWatcher;
  }
  
  const skillDirs = [...DEFAULT_SKILL_DIRS];
  if (options.projectSkillsDir && fs.existsSync(options.projectSkillsDir)) {
    skillDirs.unshift({ basePath: options.projectSkillsDir, namespace: 'project' });
  }
  
  activeWatcher = createWatcher(skillDirs, {
    pollInterval: options.pollInterval || 60000,
    enableFileWatch: options.enableFileWatch ?? true,
    enableGitCheck: options.enableGitCheck ?? false,
    debounceMs: options.debounceMs || 1000
  });
  
  activeWatcher.on('change', (changes) => {
    invalidateCache();
    if (options.onChange) {
      options.onChange(changes);
    }
  });
  
  activeWatcher.on('git-updates', (updates) => {
    if (options.onGitUpdates) {
      options.onGitUpdates(updates);
    }
  });
  
  activeWatcher.start();
  return activeWatcher;
}

function stopWatching() {
  if (activeWatcher) {
    activeWatcher.stop();
    activeWatcher = null;
  }
}

function getIndexVersion() {
  return indexVersion;
}

function scoreSkill(skill, query, queryKeywords) {
  let score = 0;

  const queryLower = query.toLowerCase();
  const descLower = skill.description.toLowerCase();
  const nameLower = skill.name.toLowerCase();

  if (nameLower === queryLower) {
    score += 100;
  } else if (nameLower.includes(queryLower) || queryLower.includes(nameLower)) {
    score += 50;
  }

  for (const trigger of skill.triggers) {
    if (queryLower.includes(trigger.toLowerCase())) {
      score += 30;
    }
  }

  const matchedKeywords = queryKeywords.filter(kw => skill.keywords.includes(kw));
  score += matchedKeywords.length * 10;

  if (descLower.includes(queryLower)) {
    score += 20;
  }

  for (const queryWord of queryKeywords) {
    if (descLower.includes(queryWord)) {
      score += 5;
    }
  }

  return score;
}

function searchSkills(query, options = {}) {
  const { limit = 5, category = null, projectSkillsDir = null } = options;
  const index = getIndex(projectSkillsDir);
  const queryKeywords = skillIndex.extractKeywords(query, true);

  let candidates = Object.values(index.skills);

  if (category && index.categories[category]) {
    const categorySkillIds = new Set(index.categories[category]);
    candidates = candidates.filter(s => categorySkillIds.has(s.id));
  }

  const scored = candidates.map(skill => ({
    skill,
    score: scoreSkill(skill, query, queryKeywords)
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter(item => item.score > 0)
    .slice(0, limit)
    .map(item => ({
      id: item.skill.id,
      name: item.skill.name,
      description: item.skill.description,
      category: item.skill.category,
      score: item.score,
      path: item.skill.path
    }));
}

function routeSkill(intent, options = {}) {
  const { projectSkillsDir = null } = options;
  const results = searchSkills(intent, { limit: 1, projectSkillsDir });

  if (results.length === 0) {
    return null;
  }

  const best = results[0];

  if (best.score < 10) {
    return null;
  }

  return {
    skill: best,
    confidence: Math.min(best.score / 100, 1.0),
    action: 'use_skill',
    command: `use_skill("${best.id}")`
  };
}

function listCategories(projectSkillsDir = null) {
  const index = getIndex(projectSkillsDir);
  return Object.entries(index.categories).map(([category, skillIds]) => ({
    category,
    count: skillIds.length,
    skills: skillIds
  }));
}

function getSkillDetails(skillId, projectSkillsDir = null) {
  const index = getIndex(projectSkillsDir);
  const skill = index.skills[skillId];

  if (!skill) {
    return null;
  }

  const skillFile = path.join(skill.path, 'SKILL.md');
  let content = '';
  try {
    content = fs.readFileSync(skillFile, 'utf8');
  } catch {
    return { ...skill, content: '', error: `Failed to read ${skillFile}` };
  }

  return {
    ...skill,
    content
  };
}

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
};
