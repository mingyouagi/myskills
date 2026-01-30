# Directory Structure

```
skill-router/
├── src/                    # Source code
│   ├── index.js            # Main entry point (exports all APIs)
│   ├── router.js           # Search and routing logic
│   ├── indexer.js          # Index building and keyword extraction
│   ├── watcher.js          # File watching and auto-discovery
│   └── plugin.js           # Claude Code plugin integration
│
├── tests/                  # Unit tests (vitest)
│   ├── search.test.js      # Search and routing tests (16 tests)
│   ├── index.test.js       # Indexer tests (15 tests)
│   └── watcher.test.js     # Watcher tests (9 tests)
│
├── examples/               # Usage examples
│   ├── basic.js            # Basic usage demo
│   ├── legacy-test-router.js
│   └── legacy-test-watcher.js
│
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

| File | Purpose | Lines |
|------|---------|-------|
| `src/router.js` | Core search and routing logic | ~217 |
| `src/indexer.js` | Index building, synonyms, categories | ~237 |
| `src/watcher.js` | Auto-discovery (file watch + hash poll) | ~280 |
| `src/plugin.js` | Claude Code plugin wrapper | ~216 |
| `src/index.js` | Main entry, exports all APIs | ~23 |
| `SKILL.md` | Claude Code skill + detailed docs | ~400 |
| `README.md` | Quick start + API reference | ~330 |
