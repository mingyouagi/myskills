# Installing myskills for Claude Code

## Quick Installation

Run these commands in your terminal:

```bash
# Create directories
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/plugin

# Clone myskills
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git

# Install dependencies for skill-router
cd myskills/skills/skill-router
npm install

# Create symlinks for skill discovery
ln -sf ~/.claude/skills/myskills/skills/skill-router ~/.claude/skills/skill-router

# Register plugin (enables route_skill, search_skills tools)
ln -sf ~/.claude/skills/myskills/.claude/plugin/skill-router.js ~/.claude/plugin/skill-router.js
```

## Verify Installation

```bash
# Check skill files
ls ~/.claude/skills/skill-router/SKILL.md

# Check plugin registration
ls ~/.claude/plugin/skill-router.js
```

## Restart Claude Code

After installation, restart Claude Code to load the new plugin.

## Available Tools

Once installed, you can use these tools:

| Tool | Description |
|------|-------------|
| `route_skill` | Find the best skill for an intent |
| `search_skills` | Search skills with ranking |
| `list_skill_categories` | Browse all categories |

## Usage

Once installed, Claude Code can use the skills via:

1. **Automatic Discovery**: Claude will find and use skills based on context
2. **Direct Reference**: Ask Claude to "use skill-router to find the right skill"
3. **Manual Invocation**: Reference the SKILL.md file directly

## Available Skills

### skill-router
- **Purpose**: Intelligent skill discovery and routing
- **Use when**: You have many skills and need to find the right one
- **Triggers**: "find skill", "which skill", "search skills"

## Updating

```bash
cd ~/.claude/skills/myskills
git pull
```

## Uninstalling

```bash
rm -rf ~/.claude/skills/myskills
```
