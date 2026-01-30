# Skill Router

> Intelligent skill discovery and routing for AI agents with large skill libraries

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Problem

When AI agents have access to 10+ skills, they face:
- **Discovery confusion**: Which skill applies to my task?
- **Naming mismatch**: Skill names don't match intent keywords  
- **Token waste**: Loading full skill lists into context every time
- **False negatives**: Missing relevant skills due to poor search

## Solution

Skill Router provides meta-tools for intelligent skill management:

```javascript
// Before: Agent loads 2000 tokens of skill list
find_skills() → [all skills...] → reasoning → use_skill()

// After: Agent uses ~50 tokens
route_skill("debug failing test") → systematic-debugging (95% confidence)
```

**Result**: 96% token reduction + better skill selection

## Features

- 🎯 **Intent-based routing**: `route_skill("fix bug")` → automatic skill selection
- 🔍 **Semantic search**: Synonym expansion + keyword matching
- 🗂️ **Auto-categorization**: Infers categories from skill content
- 🔄 **Auto-discovery**: Detects added/updated/removed skills in real-time
- 📦 **Zero config**: Works out-of-the-box with Claude Code/Superpowers

## Quick Start

### Installation

```bash
# Not yet published to npm
# For now, clone the repository:
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git
```

### Basic Usage

```javascript
import { searchSkills, routeSkill } from 'skill-router';

// Search for skills
const results = searchSkills("debug issue", { limit: 3 });
// → [{ id: "systematic-debugging", score: 105, ... }, ...]

// Auto-route based on intent
const best = routeSkill("fix a failing test");
// → { skill: {...}, confidence: 0.95, command: 'use_skill("systematic-debugging")' }
```

### As Claude Code Plugin

```javascript
// .claude/plugin/skill-router.js
import { SkillRouterPlugin } from 'skill-router';

export default SkillRouterPlugin;
```

Then use via tools:
```
route_skill("create new feature")
search_skills("debug", limit=5)
list_skill_categories()
```

## How It Works

### 1. Index Building

Scans skill directories and builds an inverted index:

```javascript
{
  skills: { "systematic-debugging": { name, description, triggers, ... } },
  keywords: { "debug": ["systematic-debugging", ...], ... },
  categories: { "technique": ["systematic-debugging", ...], ... }
}
```

Cached for 5 minutes to avoid repeated filesystem scans.

### 2. Scoring Algorithm

Each skill is scored against the query:

| Signal | Score |
|--------|-------|
| Exact name match | +100 |
| Partial name match | +50 |
| Trigger word match | +30 |
| Keyword overlap | +10 per keyword |
| Description contains query | +20 |

### 3. Auto-Discovery

Three detection mechanisms working in parallel:

| Mechanism | Trigger | Latency | Use Case |
|-----------|---------|---------|----------|
| **File Watch** | fs.watch events | ~1s | Real-time during development |
| **Hash Poll** | Content hash comparison | ~60s | Reliable background detection |
| **Git Check** | Remote repo updates | ~60s | Optional: long-running services |

```javascript
import { startWatching } from 'skill-router';

startWatching({
  enableFileWatch: true,
  pollInterval: 60000,
  
  onChange: (changes) => {
    console.log('Added:', changes.added);
    console.log('Updated:', changes.updated);
    console.log('Removed:', changes.removed);
    // Cache automatically invalidated
  }
});
```

## API Reference

### Core Functions

#### `searchSkills(query, options)`

Search for skills with ranking.

**Parameters:**
- `query` (string): Intent or keywords
- `options.limit` (number): Max results (default: 5)
- `options.category` (string): Filter by category
- `options.projectSkillsDir` (string): Additional skill directory

**Returns:** `Array<{ id, name, description, category, score, path }>`

#### `routeSkill(intent, options)`

Automatically select the best skill for an intent.

**Parameters:**
- `intent` (string): What you want to accomplish

**Returns:** `{ skill, confidence, action, command }` or `null`

#### `listCategories(projectSkillsDir)`

List all skill categories.

**Returns:** `Array<{ category, count, skills }>`

#### `getSkillDetails(skillId, projectSkillsDir)`

Get full skill content and metadata.

**Returns:** Skill object with content, or `null`

### Watcher Functions

#### `startWatching(options)`

Start monitoring skill directories for changes.

**Options:**
- `projectSkillsDir` (string): Project skills path
- `pollInterval` (number): Polling interval in ms (default: 60000)
- `enableFileWatch` (boolean): Enable fs.watch (default: true)
- `enableGitCheck` (boolean): Check for remote updates (default: false)
- `debounceMs` (number): Debounce delay (default: 500)
- `onChange` (function): Callback when skills change
- `onGitUpdates` (function): Callback when git updates available

**Returns:** SkillWatcher instance

#### `stopWatching()`

Stop all watchers.

#### `invalidateCache()`

Manually clear the cached index.

## Skill Format

Enhance your skills with frontmatter for better routing:

```yaml
---
name: systematic-debugging
description: Use when encountering bugs, test failures, or unexpected behavior
category: technique
triggers: [debug, bug, test failure, error, unexpected, broken, fix]
---

# Systematic Debugging

Your skill content here...
```

### Frontmatter Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `name` | Display name | `systematic-debugging` |
| `description` | When to use | `Use when encountering bugs...` |
| `category` | Grouping | `technique`, `process`, `discipline` |
| `triggers` | Keywords for matching | `[debug, bug, test failure]` |

## Directory Structure

```
~/.claude/
├── superpowers/skills/          # superpowers namespace
│   ├── brainstorming/
│   │   └── SKILL.md
│   └── systematic-debugging/
│       └── SKILL.md
├── skills/                      # personal namespace
│   └── my-skill/
│       └── SKILL.md
└── {project}/.claude/skills/  # project namespace
    └── project-skill/
        └── SKILL.md
```

Priority: `project:skill` > `skill` > `superpowers:skill`

## Examples

### Development Setup

```javascript
import { startWatching, searchSkills } from 'skill-router';

// Real-time updates during development
startWatching({
  projectSkillsDir: '.claude/skills',
  enableFileWatch: true,
  enableGitCheck: false,
  
  onChange: ({ added, updated, removed }) => {
    console.log(`Skills changed: +${added.length} ~${updated.length} -${removed.length}`);
  }
});

// Search will automatically use fresh index
const results = searchSkills("implement feature");
```

### Production Service

```javascript
import { startWatching } from 'skill-router';

// Polling only, with git update alerts
startWatching({
  enableFileWatch: false,
  enableGitCheck: true,
  pollInterval: 300000,  // 5 minutes
  
  onGitUpdates: (updates) => {
    alertAdmin(`Skill updates available: ${updates[0].message}`);
  }
});
```

### Custom Integration

```javascript
import { getIndex, invalidateCache } from 'skill-router';

// Manual control
const index = getIndex();
console.log(`Loaded ${Object.keys(index.skills).length} skills`);

// Force refresh
invalidateCache();
const freshIndex = getIndex();
```

## Comparison

### vs. find_skills (Claude Code built-in)

| Feature | find_skills | skill-router |
|---------|-------------|--------------|
| Token cost | ~2000 tokens | ~50 tokens |
| Search | None | Semantic + ranking |
| Auto-routing | No | Yes |
| Categories | No | Auto-inferred |
| Auto-discovery | No | Yes (3 mechanisms) |

### vs. Composio Tool Router

Skill Router is inspired by [Composio's Tool Router](https://docs.composio.dev/tool-router/overview) but focused on:
- Local skill management (not cloud services)
- Token optimization for context-limited agents
- Claude Code/Superpowers ecosystem integration

## Performance

- **Index building**: ~50ms for 15 skills
- **Search query**: ~5ms with cached index
- **File watch latency**: ~1s (debounced)
- **Memory overhead**: ~100KB for 50 skills

## Roadmap

- [ ] Embedding-based semantic search (optional)
- [ ] Skill dependency graph
- [ ] Usage analytics (which skills are most useful)
- [ ] Web UI for skill browsing
- [ ] Multi-language support (currently English-optimized)

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

MIT License - see [LICENSE](LICENSE)

## Credits

- Inspired by [Composio Tool Router](https://docs.composio.dev/tool-router/overview)
- Built for [Claude Code](https://github.com/claude-code-ai) and [Superpowers](https://github.com/superpowers) ecosystems
