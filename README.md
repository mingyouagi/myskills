# My Skills

> A collection of intelligent skills for AI agents

This repository contains custom skills designed to enhance AI agents' capabilities, particularly for the Claude Code ecosystem.

## Available Skills

### 🧭 [skill-router](./skills/skill-router)

Intelligent skill discovery and routing for agents with large skill libraries.

**Problem**: When agents have 10+ skills, finding the right one wastes tokens and time.

**Solution**: Intent-based routing with semantic search, auto-discovery, and 96% token savings.

```javascript
import { routeSkill } from 'skill-router';
routeSkill("debug failing test") 
// → systematic-debugging (95% confidence)
```

**Status**: ✅ Ready for use  
**Version**: 0.1.0  
**Tests**: 40/40 passing

[📖 Full Documentation](./skills/skill-router/docs/)

---

## Installation

### For Claude Code

**Quick Install** - Tell Claude:

```
Fetch and follow instructions from https://raw.githubusercontent.com/mingyouagi/myskills/main/.claude/INSTALL.md
```

**Manual Install**:

```bash
# Create directories
mkdir -p ~/.claude/skills ~/.claude/plugin

# Clone myskills
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git

# Install dependencies
cd myskills/skills/skill-router
npm install

# Create symlinks for skill discovery
ln -sf ~/.claude/skills/myskills/skills/skill-router ~/.claude/skills/skill-router

# Register plugin (enables route_skill, search_skills tools)
ln -sf ~/.claude/skills/myskills/.claude/plugin/skill-router.js ~/.claude/plugin/skill-router.js

# Restart Claude Code to load the plugin
```

**Verify Installation**:
```bash
ls ~/.claude/skills/skill-router/SKILL.md
ls ~/.claude/plugin/skill-router.js
```

### Available Commands

Once installed, you can use these commands in Claude Code:

| Command | Description |
|---------|-------------|
| `/myskills:route <intent>` | Find the best skill for an intent |
| `/myskills:search <query>` | Search skills with ranking |
| `/myskills:list` | Browse skills by category |

### For npm/JavaScript Projects

> **Note**: Not yet published to npm. Use Git installation:

```bash
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git
```

## Usage

### For AI Agents

Skills in this repo include frontmatter metadata for discoverability:

```yaml
---
name: skill-router
description: Use when facing many skills and unsure which to choose
triggers: [find skill, which skill, search skills]
---
```

Agents can use the `find_skills` tool or `skill-router` itself to discover appropriate skills.

### For Developers

Each skill is a standalone npm package with full TypeScript/JavaScript API:

```javascript
import { searchSkills, routeSkill } from 'skill-router';
```

See individual skill READMEs for detailed usage.

## Roadmap

### Current Skills
- ✅ **skill-router** - Intelligent skill discovery and routing

### Planned Skills
- 🔜 **skill-composer** - Combine multiple skills into workflows
- 🔜 **skill-analyzer** - Analyze skill usage patterns and suggest optimizations
- 💡 **Your idea here** - [Suggest a skill](../../issues/new)

## Contributing

Contributions welcome! Whether you want to:
- 🐛 Report bugs
- 💡 Suggest new skills
- 🔧 Improve existing skills
- 📖 Enhance documentation

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Development

### Repository Structure

```
myskills/
├── .claude/             # Claude Code configuration
│   ├── settings.json    # Plugin settings
│   └── INSTALL.md       # Installation guide
├── commands/            # Claude Code commands
│   ├── route.md         # /myskills:route
│   ├── search.md        # /myskills:search
│   └── list.md          # /myskills:list
├── skills/              # All skills
│   ├── skill-router/    # Intelligent routing
│   └── skill-*/         # Future skills
├── README.md            # This file
├── LICENSE              # MIT License
└── CONTRIBUTING.md      # Contribution guide
```

### Adding a New Skill

1. Create a directory: `skills/your-skill-name/`
2. Add `SKILL.md` with frontmatter
3. Implement your skill
4. Add tests
5. Update this README
6. Submit PR

See [skill-router](./skills/skill-router) as a reference implementation.

## Philosophy

**Skills should be:**
- 🎯 **Focused**: One clear purpose
- 🧪 **Tested**: Comprehensive test coverage
- 📚 **Documented**: Clear usage examples
- 🔄 **Composable**: Work well with other skills
- 🚀 **Performant**: Minimize token usage

## License

MIT License - see [LICENSE](./LICENSE)

Individual skills may have additional licensing terms (see their respective directories).

## Author

**mingyouagi** ([@mingyouagi](https://github.com/mingyouagi))

## Acknowledgments

- Inspired by [Superpowers](https://github.com/obra/superpowers) - the excellent agentic skills framework
- Built for the Claude Code and AI agent ecosystem
- Community contributions welcome!

---

**Star ⭐ this repo if you find these skills useful!**
