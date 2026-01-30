# My Skills

> Intelligent skills for AI coding agents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Quick Start

```bash
# One-line install (Claude Code)
cd ~/.claude/skills && git clone https://github.com/mingyouagi/myskills.git && cd myskills/skills/skill-router && ./install.sh

# Use it
skill-router search "debug"
skill-router route "fix a bug"
```

## Available Skills

| Skill | Description | Status |
|-------|-------------|--------|
| [skill-router](./skills/skill-router) | Intent-based skill discovery and routing | ✅ Ready |

### skill-router

When agents have 10+ skills, finding the right one wastes tokens. skill-router solves this with semantic search and intent-based routing.

```bash
skill-router route "debug failing test"
# → systematic-debugging (95% confidence)

skill-router search "create feature"
# → brainstorming, writing-plans, test-driven-development
```

**Token savings**: 96% reduction (2000 → 50 tokens)

## Installation

### Supported Platforms

| Platform | Skills Directory |
|----------|------------------|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.codex/skills/` |
| OpenCode | `~/.opencode/skills/` |

### Install Script (Recommended)

```bash
# Replace <SKILLS_DIR> with your platform's directory
cd <SKILLS_DIR>
git clone https://github.com/mingyouagi/myskills.git
cd myskills/skills/skill-router
./install.sh
```

### Manual Install

```bash
cd <SKILLS_DIR>
git clone https://github.com/mingyouagi/myskills.git
cd myskills/skills/skill-router
npm install && npm link
ln -sf "$(pwd)" <SKILLS_DIR>/skill-router
```

### Verify

```bash
skill-router list
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `skill-router route <intent>` | Auto-route to best skill |
| `skill-router search <query>` | Search with ranking |
| `skill-router list` | List by category |
| `skill-router detail <id>` | Show skill details |
| `skill-router config` | Show configuration |

## For Developers

### Programmatic API

```javascript
import { routeSkill, searchSkills } from 'skill-router';

const best = routeSkill("debug failing test");
// → { skill: { id: "systematic-debugging" }, confidence: 0.95 }

const results = searchSkills("create feature", { limit: 3 });
```

### Skill Frontmatter

Skills use YAML frontmatter for discoverability:

```yaml
---
name: my-skill
description: Use when doing X
category: technique
triggers: [keyword1, keyword2]
---
```

## Project Structure

```
myskills/
├── skills/
│   └── skill-router/    # Intelligent routing
├── .claude/             # Claude Code config
└── README.md
```

## Roadmap

- ✅ skill-router - Intelligent discovery and routing
- 🔜 skill-composer - Combine skills into workflows
- 🔜 skill-analyzer - Usage patterns and optimization

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](./LICENSE)

## Links

- [skill-router docs](./skills/skill-router/docs/)
- [Report issues](https://github.com/mingyouagi/myskills/issues)
- Inspired by [Superpowers](https://github.com/obra/superpowers)
