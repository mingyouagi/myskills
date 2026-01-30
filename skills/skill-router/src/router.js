import fs from 'fs';
import path from 'path';
import os from 'os';
import * as skillIndex from './indexer.js';
import { createWatcher } from './watcher.js';
import {
  searchSkillsWithIndex,
  routeSkillWithIndex,
  listCategoriesFromIndex,
  getSkillDetailsFromIndex
} from './core.js';

const homeDir = os.homedir();

// Find the latest superpowers version
function findSuperpowersPath() {
  const basePath = path.join(homeDir, '.claude/plugins/cache/claude-plugins-official/superpowers');
  if (!fs.existsSync(basePath)) return null;

  try {
    const versions = fs.readdirSync(basePath)
      .filter(v => /^\d+\.\d+\.\d+$/.test(v))
      .sort((a, b) => {
        const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
        const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
        return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch;
      });

    if (versions.length > 0) {
      return path.join(basePath, versions[0], 'skills');
    }
  } catch {
    // Ignore errors
  }
  return null;
}

const superpowersPath = findSuperpowersPath();

const DEFAULT_SKILL_DIRS = [
  ...(superpowersPath ? [{ basePath: superpowersPath, namespace: 'superpowers' }] : []),
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

// Public API - wraps core functions with index management
function searchSkills(query, options = {}) {
  const { projectSkillsDir = null, ...searchOptions } = options;
  const index = getIndex(projectSkillsDir);
  return searchSkillsWithIndex(query, index, searchOptions);
}

function routeSkill(intent, options = {}) {
  const { projectSkillsDir = null } = options;
  const index = getIndex(projectSkillsDir);
  return routeSkillWithIndex(intent, index);
}

function listCategories(projectSkillsDir = null) {
  const index = getIndex(projectSkillsDir);
  return listCategoriesFromIndex(index);
}

function getSkillDetails(skillId, projectSkillsDir = null) {
  const index = getIndex(projectSkillsDir);
  return getSkillDetailsFromIndex(skillId, index);
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
