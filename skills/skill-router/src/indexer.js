import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_FILE = '.skill-index-cache.json';

function extractFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let inFrontmatter = false;
    const metadata = {};

    for (const line of lines) {
      if (line.trim() === '---') {
        if (inFrontmatter) break;
        inFrontmatter = true;
        continue;
      }

      if (inFrontmatter) {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          const [, key, value] = match;
          if (value.startsWith('[') && value.endsWith(']')) {
            metadata[key] = value.slice(1, -1).split(',').map(s => s.trim());
          } else {
            metadata[key] = value.trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }

    return metadata;
  } catch {
    return {};
  }
}

const SYNONYMS = {
  debug: ['debugging', 'bug', 'bugfix', 'fix', 'issue', 'problem', 'error', 'failure'],
  test: ['testing', 'tests', 'tdd', 'spec', 'unittest'],
  create: ['creating', 'build', 'building', 'new', 'add', 'adding', 'implement'],
  feature: ['features', 'functionality', 'component', 'module'],
  plan: ['planning', 'plans', 'design', 'architecture', 'spec'],
  review: ['reviewing', 'reviews', 'feedback', 'pr', 'pullrequest'],
  fix: ['fixing', 'repair', 'patch', 'hotfix', 'bugfix'],
  start: ['starting', 'begin', 'beginning', 'init', 'initialize', 'setup'],
  finish: ['finishing', 'complete', 'completing', 'done', 'end', 'wrap'],
  branch: ['branches', 'git', 'worktree', 'merge'],
  skill: ['skills', 'superpowers', 'ability', 'capability']
};

function expandWithSynonyms(words) {
  const expanded = new Set(words);
  for (const word of words) {
    if (SYNONYMS[word]) {
      for (const syn of SYNONYMS[word]) {
        expanded.add(syn);
      }
    }
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (syns.includes(word)) {
        expanded.add(key);
        for (const syn of syns) {
          expanded.add(syn);
        }
      }
    }
  }
  return [...expanded];
}

function extractKeywords(text, expandSynonyms = false) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'then', 'once', 'here',
    'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that',
    'these', 'those', 'use', 'using', 'used'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return expandSynonyms ? expandWithSynonyms(words) : words;
}

function findSkillFiles(dir, maxDepth = 3) {
  const skills = [];

  function recurse(currentDir, depth) {
    if (depth > maxDepth || !fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        const skillFile = path.join(fullPath, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          skills.push({
            dir: fullPath,
            file: skillFile,
            name: entry.name
          });
        }
        recurse(fullPath, depth + 1);
      }
    }
  }

  recurse(dir, 0);
  return skills;
}

const CATEGORY_PATTERNS = {
  process: ['brainstorm', 'plan', 'planning', 'execute', 'executing', 'workflow', 'start', 'begin'],
  technique: ['debug', 'debugging', 'systematic', 'method', 'approach', 'algorithm', 'pattern'],
  discipline: ['must', 'always', 'never', 'before', 'rule', 'verification', 'tdd', 'test-driven'],
  coordination: ['parallel', 'agent', 'subagent', 'dispatch', 'delegate', 'orchestrat'],
  lifecycle: ['branch', 'worktree', 'git', 'merge', 'finish', 'complete', 'release'],
  quality: ['review', 'feedback', 'verify', 'validation', 'check', 'ensure']
};

function inferCategory(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (text.includes(pattern)) {
        return category;
      }
    }
  }
  
  return 'general';
}

function buildSkillIndex(skillDirs) {
  const index = {
    version: '1.0',
    buildTime: new Date().toISOString(),
    skills: {},
    keywords: {},
    categories: {}
  };

  for (const { basePath, namespace } of skillDirs) {
    const skillFiles = findSkillFiles(basePath);

    for (const { dir, file, name } of skillFiles) {
      const metadata = extractFrontmatter(file);
      const skillId = namespace ? `${namespace}:${name}` : name;
      
      const skillName = metadata.name || name;
      const skillDesc = metadata.description || '';
      const inferredCategory = inferCategory(skillName, skillDesc);

      const skillEntry = {
        id: skillId,
        name: skillName,
        description: skillDesc,
        category: metadata.category || inferredCategory,
        triggers: metadata.triggers || [],
        path: dir,
        namespace
      };

      const allText = `${skillEntry.name} ${skillEntry.description} ${skillEntry.triggers.join(' ')}`;
      skillEntry.keywords = [...new Set([
        ...extractKeywords(allText, true),
        ...skillEntry.triggers.map(t => t.toLowerCase())
      ])];

      index.skills[skillId] = skillEntry;

      for (const keyword of skillEntry.keywords) {
        if (!index.keywords[keyword]) {
          index.keywords[keyword] = [];
        }
        index.keywords[keyword].push(skillId);
      }

      const category = skillEntry.category;
      if (!index.categories[category]) {
        index.categories[category] = [];
      }
      index.categories[category].push(skillId);
    }
  }

  return index;
}

function computeIndexHash(index) {
  const content = JSON.stringify(index.skills);
  return crypto.createHash('md5').update(content).digest('hex');
}

function loadCachedIndex(cacheDir) {
  const cachePath = path.join(cacheDir, CACHE_FILE);
  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
}

function saveCachedIndex(cacheDir, index) {
  const cachePath = path.join(cacheDir, CACHE_FILE);
  fs.writeFileSync(cachePath, JSON.stringify(index, null, 2));
}

export {
  buildSkillIndex,
  extractFrontmatter,
  extractKeywords,
  findSkillFiles,
  computeIndexHash,
  loadCachedIndex,
  saveCachedIndex
};
