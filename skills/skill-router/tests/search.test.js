import { describe, it, expect, beforeAll } from 'vitest';
import { searchSkills, routeSkill, listCategories, getIndex, invalidateCache } from '../src/router.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectSkillsDir = path.resolve(__dirname, '../../');

describe('searchSkills', () => {
  beforeAll(() => {
    invalidateCache();
  });

  it('returns empty array for nonsense query', () => {
    const results = searchSkills('xyznonexistent123', { projectSkillsDir });
    expect(results).toEqual([]);
  });

  it('returns results for valid query', () => {
    const results = searchSkills('skill router', { projectSkillsDir });
    expect(results.length).toBeGreaterThan(0);
  });

  it('respects limit option', () => {
    const results = searchSkills('test', { limit: 2, projectSkillsDir });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('returns results sorted by score descending', () => {
    const results = searchSkills('skill router', { limit: 5, projectSkillsDir });
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('includes required fields in results', () => {
    const results = searchSkills('skill', { limit: 1, projectSkillsDir });
    if (results.length > 0) {
      const result = results[0];
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('path');
    }
  });

  it('filters by category when specified', () => {
    const categories = listCategories(projectSkillsDir);
    if (categories.length > 0) {
      const category = categories[0].category;
      const results = searchSkills('skill', { category, limit: 10, projectSkillsDir });
      for (const result of results) {
        expect(result.category).toBe(category);
      }
    }
  });
});

describe('routeSkill', () => {
  beforeAll(() => {
    invalidateCache();
  });

  it('returns null for nonsense intent', () => {
    const result = routeSkill('xyznonexistent123', { projectSkillsDir });
    expect(result).toBeNull();
  });

  it('returns skill with confidence for valid intent', () => {
    const result = routeSkill('find skill router', { projectSkillsDir });
    if (result) {
      expect(result).toHaveProperty('skill');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('command');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('returns command in correct format', () => {
    const result = routeSkill('skill router', { projectSkillsDir });
    if (result) {
      expect(result.command).toMatch(/^use_skill\(".*"\)$/);
    }
  });
});

describe('listCategories', () => {
  it('returns array of categories', () => {
    const categories = listCategories(projectSkillsDir);
    expect(Array.isArray(categories)).toBe(true);
  });

  it('each category has required fields', () => {
    const categories = listCategories(projectSkillsDir);
    for (const cat of categories) {
      expect(cat).toHaveProperty('category');
      expect(cat).toHaveProperty('count');
      expect(cat).toHaveProperty('skills');
      expect(typeof cat.category).toBe('string');
      expect(typeof cat.count).toBe('number');
      expect(Array.isArray(cat.skills)).toBe(true);
    }
  });

  it('count matches skills array length', () => {
    const categories = listCategories(projectSkillsDir);
    for (const cat of categories) {
      expect(cat.count).toBe(cat.skills.length);
    }
  });
});

describe('getIndex', () => {
  it('returns index with required structure', () => {
    const index = getIndex(projectSkillsDir);
    expect(index).toHaveProperty('skills');
    expect(index).toHaveProperty('keywords');
    expect(index).toHaveProperty('categories');
    expect(index).toHaveProperty('buildTime');
  });

  it('skills object is not empty when skills exist', () => {
    const index = getIndex(projectSkillsDir);
    expect(Object.keys(index.skills).length).toBeGreaterThan(0);
  });

  it('returns cached index on subsequent calls', () => {
    const index1 = getIndex(projectSkillsDir);
    const index2 = getIndex(projectSkillsDir);
    expect(index1.buildTime).toBe(index2.buildTime);
  });

  it('returns fresh index after invalidateCache', () => {
    const index1 = getIndex(projectSkillsDir);
    const buildTime1 = index1.buildTime;
    
    invalidateCache();
    const index2 = getIndex(projectSkillsDir);
    
    expect(index2.buildTime).not.toBe(buildTime1);
  });
});
