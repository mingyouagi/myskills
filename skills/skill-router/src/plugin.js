import fs from 'fs';
import path from 'path';
import os from 'os';
import { tool } from '@anthropic/claude-code-plugin/tool';
import * as skillIndex from './skill-index.js';

const homeDir = os.homedir();

const DEFAULT_SKILL_DIRS = [
  { basePath: path.join(homeDir, '.claude/superpowers/skills'), namespace: 'superpowers' },
  { basePath: path.join(homeDir, '.claude/skills'), namespace: null }
];

let cachedIndex = null;
let indexBuildTime = null;
const INDEX_TTL_MS = 5 * 60 * 1000;

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
  indexBuildTime = now;
  return cachedIndex;
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
  } catch {}

  return {
    ...skill,
    content
  };
}

const searchSkillsTool = tool({
  description: 'Search for skills by intent or keywords. Returns ranked results with relevance scores.',
  args: {
    query: tool.schema.string().describe('What you want to do (e.g., "debug a complex issue", "create a new feature")'),
    limit: tool.schema.number().optional().describe('Maximum results to return (default: 5)'),
    category: tool.schema.string().optional().describe('Filter by category (e.g., "process", "technique", "discipline")')
  },
  execute: async (args, context) => {
    const { query, limit = 5, category } = args;
    const projectSkillsDir = context?.directory ? path.join(context.directory, '.claude/skills') : null;

    const results = searchSkills(query, { limit, category, projectSkillsDir });

    if (results.length === 0) {
      return 'No matching skills found. Try different keywords or run `list_skill_categories` to see available categories.';
    }

    let output = `Found ${results.length} skill(s) for "${query}":\n\n`;

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const confidence = Math.min(r.score / 100, 1.0);
      const confidenceLabel = confidence > 0.7 ? 'HIGH' : confidence > 0.4 ? 'MEDIUM' : 'LOW';

      output += `${i + 1}. **${r.id}** [${confidenceLabel}]\n`;
      output += `   ${r.description}\n`;
      output += `   Category: ${r.category} | Path: ${r.path}\n\n`;
    }

    output += `\nTo use a skill: \`use_skill("skill-id")\``;
    return output;
  }
});

const routeSkillTool = tool({
  description: 'Automatically select the best skill for your intent. Returns the recommended skill with confidence score.',
  args: {
    intent: tool.schema.string().describe('Describe what you want to accomplish')
  },
  execute: async (args, context) => {
    const { intent } = args;
    const projectSkillsDir = context?.directory ? path.join(context.directory, '.claude/skills') : null;

    const result = routeSkill(intent, { projectSkillsDir });

    if (!result) {
      return `No skill found for "${intent}". This task may not require a skill, or try \`search_skills\` with different keywords.`;
    }

    const confidencePercent = Math.round(result.confidence * 100);
    let recommendation = '';

    if (result.confidence > 0.7) {
      recommendation = 'RECOMMENDED: Load this skill';
    } else if (result.confidence > 0.4) {
      recommendation = 'SUGGESTED: Consider this skill';
    } else {
      recommendation = 'POSSIBLE: Low confidence match';
    }

    return `**Skill Router Result**

Intent: "${intent}"
Best Match: **${result.skill.id}**
Confidence: ${confidencePercent}%
${recommendation}

Description: ${result.skill.description}
Category: ${result.skill.category}

Action: \`${result.command}\``;
  }
});

const listSkillCategoriesTool = tool({
  description: 'List all skill categories with their skill counts.',
  args: {},
  execute: async (args, context) => {
    const projectSkillsDir = context?.directory ? path.join(context.directory, '.claude/skills') : null;
    const categories = listCategories(projectSkillsDir);

    if (categories.length === 0) {
      return 'No skill categories found.';
    }

    let output = 'Skill Categories:\n\n';

    for (const cat of categories) {
      output += `**${cat.category}** (${cat.count} skills)\n`;
      output += `  Skills: ${cat.skills.join(', ')}\n\n`;
    }

    return output;
  }
});

const getSkillDetailsTool = tool({
  description: 'Get detailed information about a specific skill including its full content.',
  args: {
    skill_id: tool.schema.string().describe('The skill ID (e.g., "superpowers:brainstorming")')
  },
  execute: async (args, context) => {
    const { skill_id } = args;
    const projectSkillsDir = context?.directory ? path.join(context.directory, '.claude/skills') : null;

    const details = getSkillDetails(skill_id, projectSkillsDir);

    if (!details) {
      return `Skill "${skill_id}" not found. Run \`search_skills\` to find available skills.`;
    }

    return `**${details.name}** (${details.id})

Category: ${details.category}
Triggers: ${details.triggers.join(', ') || 'none'}
Path: ${details.path}

---

${details.content}`;
  }
});

export const SkillRouterPlugin = async ({ client, directory }) => {
  return {
    tool: {
      search_skills: searchSkillsTool,
      route_skill: routeSkillTool,
      list_skill_categories: listSkillCategoriesTool,
      get_skill_details: getSkillDetailsTool
    }
  };
};

export {
  searchSkills,
  routeSkill,
  listCategories,
  getSkillDetails,
  getIndex
};
