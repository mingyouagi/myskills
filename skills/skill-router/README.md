# Skill Router

> Intelligent skill discovery and routing for AI agents

[![Tests](https://img.shields.io/badge/tests-40%2F40%20passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Part of [myskills](https://github.com/mingyouagi/myskills) collection.

## Quick Start

### Installation

```bash
# Clone the repository
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git

# Install and link CLI globally
cd myskills/skills/skill-router
npm install
npm link
```

### CLI Usage (Recommended)

```bash
# Search for skills
skill-router search "debug"

# Auto-route to best skill
skill-router route "fix a bug"

# List all categories
skill-router list

# Get skill details
skill-router detail systematic-debugging

# JSON output
skill-router search "test" --json
```

### Programmatic Usage

```javascript
import { routeSkill, searchSkills } from 'skill-router';

// Auto-route based on intent
const best = routeSkill("debug failing test");
// → { skill: { id: "systematic-debugging", ... }, confidence: 0.95 }

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
- 🔗 Symlink support
- 📦 Zero runtime dependencies

## Usage

### CLI Commands

| Command | Description |
|---------|-------------|
| `skill-router search <query>` | Search skills by keyword |
| `skill-router route <intent>` | Auto-route to best skill |
| `skill-router list` | List all skill categories |
| `skill-router detail <id>` | Show skill details |

Options:
- `--limit, -l <n>` - Limit results (default: 5)
- `--project, -p <dir>` - Add project skills directory
- `--json` - Output as JSON

### Programmatic API

```javascript
import { searchSkills, routeSkill, listCategories } from 'skill-router';

// Search
const results = searchSkills("create feature", { limit: 3 });

// Route
const route = routeSkill("fix a bug");
// → { skill, confidence, command }

// List categories
const categories = listCategories();
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

## Documentation

- [📖 Complete Documentation](./docs/) - Full documentation index
- [🎯 SKILL.md](./SKILL.md) - Detailed guide for AI agents
- [🔧 API Reference](./docs/api-reference.md) - Complete API documentation
- [💻 Examples](./examples/) - Working code examples
- [✅ Tests](./tests/) - Test suite as documentation

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

- `src/cli.js` - Command-line interface
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
