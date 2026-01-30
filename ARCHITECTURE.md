# My Skills - Architecture

## Repository Type: Monorepo

This is a **skill collection repository** (monorepo), not a single package.

### Why Monorepo?

| Advantage | Benefit |
|-----------|---------|
| **Shared conventions** | All skills follow same structure |
| **Easier discovery** | One place to find all skills |
| **Cross-skill synergy** | Skills can reference each other |
| **Unified versioning** | Coherent release management |

## Directory Structure

```
myskills/
├── skills/                      # All skills live here
│   ├── skill-router/            # Skill 1: Intelligent routing
│   │   ├── src/                 # Source code
│   │   │   ├── index.js         # Main exports
│   │   │   ├── router.js        # Search/routing
│   │   │   ├── indexer.js       # Index building
│   │   │   ├── watcher.js       # Auto-discovery
│   │   │   └── plugin.js        # Claude Code plugin
│   │   ├── tests/               # Unit tests
│   │   ├── examples/            # Usage examples
│   │   ├── SKILL.md             # Claude Code skill file
│   │   ├── README.md            # Skill documentation
│   │   └── package.json         # npm package (independently publishable)
│   │
│   └── skill-navigator/         # Skill 2 (example)
│       ├── SKILL.md
│       └── ...
│
├── README.md                    # Repository overview
├── LICENSE                      # MIT (applies to all)
├── CONTRIBUTING.md              # How to contribute
└── .gitignore                   # Git ignore rules
```

## Skill Anatomy

Each skill is a **self-contained package** with:

### Required Files

1. **SKILL.md** - Claude Code skill file
   ```yaml
   ---
   name: skill-name
   description: Use when...
   category: meta|process|technique|...
   triggers: [keyword1, keyword2]
   ---
   ```

2. **README.md** - Human-readable documentation
   - Quick start
   - Installation
   - API reference
   - Examples

3. **package.json** - npm package metadata
   - Independent versioning
   - Can publish to npm separately
   - Or use locally via file path

### Recommended Structure

```
skills/your-skill/
├── src/           # Source code
├── tests/         # Unit tests (vitest)
├── examples/      # Usage examples
├── SKILL.md       # Claude Code skill file
├── README.md      # Documentation
├── package.json   # npm config
└── LICENSE        # Usually inherits from root
```

## Publishing Strategies

### Strategy 1: Independent npm Packages

Each skill published separately:

```bash
cd skills/skill-router
npm publish
# → npm install skill-router (once published)
```

**Pros**: 
- Users install only what they need
- Independent versioning
- Smaller package sizes

**Cons**: 
- More management overhead
- Need to publish each skill separately

### Strategy 2: Unified npm Package

Publish entire repo as one package:

```bash
npm publish
# → npm install myskills
```

```javascript
import { skillRouter } from 'myskills/skill-router';
```

**Pros**: 
- Single publish command
- All skills versioned together

**Cons**: 
- Larger package size
- All-or-nothing installation

### Strategy 3: Hybrid (Recommended)

- Publish popular skills independently to npm
- Keep experimental skills in repo only
- Users can `git clone` or `npm install skill-router` (when published)

## Usage Patterns

### As Claude Code Skills

```bash
# Clone repo to skills directory
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git

# Use any skill
use_skill("myskills/skill-router")
```

### As npm Packages

```bash
# Install specific skill (once published to npm)
npm install skill-router

# For now, use local path or git clone
# Use in code
import { routeSkill } from 'skill-router';
```

### As Git Submodules

For other projects that want to include skills:

```bash
git submodule add https://github.com/mingyouagi/myskills.git .skills
```

## Development Workflow

### Adding a New Skill

```bash
# 1. Create skill directory
mkdir -p skills/your-skill/{src,tests,examples}

# 2. Copy template
cp skills/skill-router/SKILL.md skills/your-skill/SKILL.md
# Edit frontmatter and content

# 3. Implement
code skills/your-skill/src/index.js

# 4. Test
cd skills/your-skill
npm init -y
npm install --save-dev vitest
npm test

# 5. Document
# Write README.md

# 6. Update repo README
# Add to skills list in /README.md
```

### Testing All Skills

```bash
# Test all skills
for skill in skills/*/; do
  if [ -f "$skill/package.json" ]; then
    echo "Testing $skill"
    (cd "$skill" && npm test)
  fi
done
```

### Publishing a Skill

```bash
cd skills/skill-router
npm version patch  # or minor, major
npm publish
git tag skill-router-v0.1.1
git push origin skill-router-v0.1.1
```

## Inter-Skill Dependencies

Skills can depend on each other:

```json
// skills/skill-composer/package.json
{
  "dependencies": {
    "skill-router": "file:../skill-router"
  }
}
```

Or reference after both are published:

```json
{
  "dependencies": {
    "skill-router": "^0.1.0"
  }
}
```

## Versioning

### Repository Level

- Repo version tracks collection state
- Tag format: `v1.0.0` for major milestones

### Skill Level

- Each skill has independent semantic versioning
- Tag format: `skill-router-v0.1.0`, `skill-composer-v1.2.3`

## File Sharing

### Shared Utilities (Future)

If multiple skills need common code:

```
myskills/
├── shared/              # Shared utilities
│   └── utils/
│       └── common.js
└── skills/
    ├── skill-a/
    └── skill-b/
```

Currently not needed - each skill is standalone.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guidelines
- Pull request process
- How to create a new skill

## Maintenance

### Keeping Skills Updated

```bash
# Update all skill dependencies
for skill in skills/*/; do
  if [ -f "$skill/package.json" ]; then
    (cd "$skill" && npm update)
  fi
done
```

### Running All Tests

```bash
# CI-friendly test all
npm test  # (if root package.json configured)
# or manually:
for skill in skills/*/; do
  [ -f "$skill/package.json" ] && (cd "$skill" && npm test) || true
done
```

## Design Principles

1. **Independence**: Each skill is self-contained
2. **Discoverability**: SKILL.md makes it Claude Code-compatible
3. **Publishability**: Each skill can npm publish independently
4. **Testability**: Every skill has comprehensive tests
5. **Documentation**: Clear README + SKILL.md for each

---

This architecture balances:
- 🎯 Focus (each skill solves one problem)
- 🔗 Cohesion (skills work together)
- 📦 Distribution (multiple publishing options)
- 🧪 Quality (shared testing standards)
