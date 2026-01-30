/**
 * Skill Router Plugin for Claude Code
 * 
 * Provides intelligent skill discovery and routing tools.
 * 
 * Usage:
 *   1. Symlink this file to ~/.claude/plugin/skill-router.js
 *   2. Restart Claude Code
 *   3. Use route_skill, search_skills, list_skill_categories tools
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRouterPath = path.resolve(__dirname, '../../skills/skill-router/src/index.js');

// Lazy load to avoid startup errors if not installed
let skillRouter = null;
async function getSkillRouter() {
  if (!skillRouter) {
    try {
      skillRouter = await import(skillRouterPath);
    } catch (e) {
      console.error('Failed to load skill-router:', e.message);
      return null;
    }
  }
  return skillRouter;
}

// Tool definitions following Claude Code's schema
export const tools = [
  {
    name: 'route_skill',
    description: 'Find the best skill for a given intent. Use when unsure which skill to use for a task.',
    inputSchema: {
      type: 'object',
      properties: {
        intent: {
          type: 'string',
          description: 'What you want to accomplish, e.g. "debug failing test", "create new feature"'
        }
      },
      required: ['intent']
    }
  },
  {
    name: 'search_skills',
    description: 'Search for skills matching a query with ranking. Returns multiple options.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keywords, e.g. "debug", "test", "planning"'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 5)',
          default: 5
        },
        category: {
          type: 'string',
          description: 'Filter by category (optional): technique, process, discipline, coordination, meta'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'list_skill_categories',
    description: 'List all available skill categories with their skill counts.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Tool implementations
export async function route_skill({ intent }) {
  const sr = await getSkillRouter();
  if (!sr) {
    return { error: 'skill-router not available. Run: cd ~/.claude/skills/myskills/skills/skill-router && npm install' };
  }
  
  const result = sr.routeSkill(intent);
  
  if (!result) {
    return { 
      found: false, 
      message: `No skill found for intent: "${intent}". Try search_skills for broader results.` 
    };
  }
  
  return {
    found: true,
    skill: result.skill.name,
    skillId: result.skill.id,
    confidence: Math.round(result.confidence * 100) + '%',
    description: result.skill.description,
    category: result.skill.category,
    command: result.command,
    suggestion: `To use this skill, run: ${result.command}`
  };
}

export async function search_skills({ query, limit = 5, category = null }) {
  const sr = await getSkillRouter();
  if (!sr) {
    return { error: 'skill-router not available. Run: cd ~/.claude/skills/myskills/skills/skill-router && npm install' };
  }
  
  const results = sr.searchSkills(query, { limit, category });
  
  if (results.length === 0) {
    return { 
      found: false, 
      message: `No skills found for query: "${query}"`,
      suggestion: 'Try broader keywords or list_skill_categories to explore.'
    };
  }
  
  return {
    found: true,
    count: results.length,
    query,
    results: results.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      id: r.id,
      score: r.score,
      category: r.category,
      description: r.description,
      command: `use_skill("${r.id}")`
    }))
  };
}

export async function list_skill_categories() {
  const sr = await getSkillRouter();
  if (!sr) {
    return { error: 'skill-router not available. Run: cd ~/.claude/skills/myskills/skills/skill-router && npm install' };
  }
  
  const categories = sr.listCategories();
  
  return {
    totalCategories: categories.length,
    totalSkills: categories.reduce((sum, c) => sum + c.count, 0),
    categories: categories.map(c => ({
      name: c.category,
      count: c.count,
      skills: c.skills
    }))
  };
}

// Export for Claude Code plugin system
export default {
  name: 'skill-router',
  version: '0.1.0',
  description: 'Intelligent skill discovery and routing',
  tools,
  handlers: {
    route_skill,
    search_skills,
    list_skill_categories
  }
};
