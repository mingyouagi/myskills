/**
 * Core skill routing logic - shared between router.js and plugin.js
 */

import fs from 'fs';
import path from 'path';
import * as skillIndex from './indexer.js';

/**
 * Score a skill against a query
 */
export function scoreSkill(skill, query, queryKeywords) {
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

/**
 * Search skills by query
 */
export function searchSkillsWithIndex(query, index, options = {}) {
  const { limit = 5, category = null } = options;
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

/**
 * Route to best skill based on intent
 */
export function routeSkillWithIndex(intent, index) {
  const results = searchSkillsWithIndex(intent, index, { limit: 1 });

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

/**
 * List all skill categories
 */
export function listCategoriesFromIndex(index) {
  return Object.entries(index.categories).map(([category, skillIds]) => ({
    category,
    count: skillIds.length,
    skills: skillIds
  }));
}

/**
 * Get detailed information about a skill
 */
export function getSkillDetailsFromIndex(skillId, index) {
  const skill = index.skills[skillId];

  if (!skill) {
    return null;
  }

  const skillFile = path.join(skill.path, 'SKILL.md');
  let content = '';
  let error = null;

  try {
    content = fs.readFileSync(skillFile, 'utf8');
  } catch (err) {
    error = `Failed to read ${skillFile}: ${err.message}`;
  }

  return {
    ...skill,
    content,
    ...(error && { error })
  };
}
