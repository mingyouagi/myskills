# Skill Router

> Intelligent skill discovery and routing for AI agents

[![Tests](https://img.shields.io/badge/tests-40%2F40%20passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Part of [myskills](https://github.com/mingyouagi/myskills) collection.

## Quick Start

> **Note**: Not yet published to npm. Use Git installation:

```bash
# Install from GitHub (when available)
# npm install skill-router

# For now, clone the repository:
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git
```

```javascript
import { routeSkill, searchSkills } from 'skill-router';

// Auto-route based on intent
const best = routeSkill("debug failing test");
// → { skill: "systematic-debugging", confidence: 0.95 }

// Or search with ranking
const results = searchSkills("fix bug", { limit: 3 });
// → [{ id: "systematic-debugging", score: 105 }, ...]
```

## Problem & Solution

**Problem**: Agents with 10+ skills waste 2000 tokens loading full skill lists.

**Solution**: Intent-based routing with semantic search.

**Result**: 96% token reduction (2000 → 50 tokens).

## Key Features

- 🎯 Intent-based routing
- 🔍 Semantic search with synonyms
- 🗂️ Auto-categorization
- 🔄 Auto-discovery (file watch + polling)
- 📦 Zero dependencies

## Usage

### Basic Search

```javascript
import { searchSkills } from 'skill-router';

const results = searchSkills("create feature", { limit: 3 });
// → Returns ranked skills with confidence scores
```

### Auto-Routing

```javascript
import { routeSkill } from 'skill-router';

const route = routeSkill("fix a bug");
// → { skill, confidence, command }
```

### Auto-Discovery

```javascript
import { startWatching } from 'skill-router';

startWatching({
  enableFileWatch: true,
  onChange: (changes) => {
    console.log('Skills updated:', changes);
  }
});
```

### As Claude Code Plugin

```javascript
// .claude/plugin/skill-router.js
import { SkillRouterPlugin } from 'skill-router/plugin';
export default SkillRouterPlugin;
```

Then use via tools:
```
route_skill("create new feature")
search_skills("debug", limit=5)
```

## Documentation

- [SKILL.md](./SKILL.md) - Detailed guide with algorithms and patterns
- [Examples](./examples/) - Working code examples
- [Tests](./tests/) - Test suite as documentation
- [API Reference](./README-FULL.md) - Complete API documentation

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Architecture

- `src/indexer.js` - Index building, keywords, synonyms
- `src/router.js` - Search and routing logic
- `src/watcher.js` - File watching, auto-discovery
- `src/plugin.js` - Claude Code plugin integration
- `src/index.js` - Main exports

## Performance

- Index building: ~50ms for 15 skills
- Search query: ~5ms (cached)
- File watch latency: ~1s
- Memory: ~100KB for 50 skills

## License

MIT - See [LICENSE](./LICENSE)

## Links

- [Main Repository](https://github.com/mingyouagi/myskills)
- [Report Issues](https://github.com/mingyouagi/myskills/issues)
