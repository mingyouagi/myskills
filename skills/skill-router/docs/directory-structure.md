# Directory Structure

```
skill-router/
├── src/                    # Source code
│   ├── index.js            # Main entry point (exports all APIs)
│   ├── cli.js              # Command-line interface
│   ├── config.js           # Configuration system (presets, multi-tool support)
│   ├── core.js             # Shared routing logic
│   ├── router.js           # Search and routing logic
│   ├── indexer.js          # Index building and keyword extraction
│   ├── watcher.js          # File watching and auto-discovery
│   └── plugin.js           # Claude Code plugin integration
│
├── tests/                  # Unit tests (vitest)
│   ├── search.test.js      # Search and routing tests
│   ├── index.test.js       # Indexer tests
│   ├── cli.test.js         # CLI integration tests
│   └── watcher.test.js     # Watcher tests
│
├── examples/               # Usage examples
│   ├── basic.js            # Basic usage demo
│   ├── legacy-test-router.js
│   └── legacy-test-watcher.js
│
├── install.sh              # Installation script (npm link + symlinks)
├── config.example.json     # Example configuration file
├── README.md               # Main documentation
├── SKILL.md                # Claude Code skill file (with frontmatter)
├── LICENSE                 # MIT License
├── CONTRIBUTING.md         # Contribution guidelines
├── OPENSOURCE-CHECKLIST.md # Release checklist (optional)
├── docs/
│   ├── README.md                # Documentation index
│   ├── api-reference.md         # Complete API documentation
│   ├── contributing.md          # Contribution guidelines
│   └── directory-structure.md   # This file
├── package.json            # npm package configuration
├── vitest.config.js        # Test configuration with coverage
└── .gitignore              # Git ignore rules
```

## Why SKILL.md is at Root

`SKILL.md` has dual purposes:

1. **Claude Code Skill File**: Contains frontmatter metadata for skill-router to be discoverable by Claude Code/Superpowers
2. **Detailed Documentation**: Comprehensive guide for using skill-router

Keeping it at root allows:
- Users can install skill-router as a skill: `~/.claude/skills/skill-router/SKILL.md`
- npm package includes it for reference

## Import Paths

### For end users (after npm install):

```javascript
// Main API (default export)
import { searchSkills, routeSkill } from 'skill-router';

// Specific modules
import { SkillWatcher } from 'skill-router/watcher';
import { buildSkillIndex } from 'skill-router/indexer';
import { SkillRouterPlugin } from 'skill-router/plugin';
```

### For development (local):

```javascript
// From tests/examples
import { searchSkills } from '../src/index.js';
import { SkillWatcher } from '../src/watcher.js';
```

## File Naming Conventions

- **Source files**: Descriptive names (router.js, indexer.js, watcher.js)
- **Test files**: Match source with `.test.js` suffix
- **Examples**: Descriptive with `.js` extension
- **Root docs**: UPPERCASE.md for discoverability

## Key Files

| File | Purpose |
|------|---------|
| `src/cli.js` | Command-line interface with i18n |
| `src/config.js` | Configuration system with presets |
| `src/core.js` | Shared scoring and routing logic |
| `src/router.js` | Search and routing API |
| `src/indexer.js` | Index building, synonyms, categories |
| `src/watcher.js` | Auto-discovery (file watch + hash poll) |
| `src/plugin.js` | Claude Code plugin wrapper |
| `src/index.js` | Main entry, exports all APIs |
| `install.sh` | Installation script for multi-tool setup |
| `SKILL.md` | Claude Code skill + detailed docs |
| `README.md` | Quick start + API reference |
