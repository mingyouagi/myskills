# Installing myskills for Claude Code

## Quick Installation

Run these commands in your terminal:

```bash
# Create skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# Clone myskills
cd ~/.claude/skills
git clone https://github.com/mingyouagi/myskills.git

# Install dependencies for skill-router
cd myskills/skills/skill-router
npm install
```

## Verify Installation

Check that the skill files exist:

```bash
ls ~/.claude/skills/myskills/skills/skill-router/SKILL.md
```

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
