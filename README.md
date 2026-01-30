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

### As Claude Code Skills

Clone this repo to your Claude Code skills directory:

```bash
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git
```

Then use any skill via:
```
use_skill("myskills/skill-router")
```

### As npm Packages

> **Note**: Skills are not yet published to npm. For now, use Git installation or local development.

```bash
# Install from GitHub
npm install github:mingyouagi/myskills#main:skills/skill-router

# Or clone locally
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
├── skills/              # All skills
│   ├── skill-router/    # Intelligent routing
│   ├── skill-*/         # Future skills
│   └── ...
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

- Inspired by [Claude Code](https://github.com/claude-code-ai) and [Superpowers](https://github.com/superpowers)
- Built for the AI agent ecosystem
- Community contributions welcome!

---

**Star ⭐ this repo if you find these skills useful!**
