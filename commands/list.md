---
name: list
description: List all available skill categories
usage: /myskills:list [--category CAT]
---

# List Skills Command

Browse all available skills organized by category.

## Usage

```
/myskills:list
/myskills:list --category technique
```

## Options

| Option | Description |
|--------|-------------|
| `--category CAT` | Show only skills in this category |

## Output

Shows all categories with their skill counts:

```
> /myskills:list

Available Skill Categories:

📁 technique (3 skills)
   - systematic-debugging
   - condition-based-waiting
   - root-cause-tracing

📁 process (4 skills)
   - brainstorming
   - writing-plans
   - executing-plans
   - using-git-worktrees

📁 discipline (3 skills)
   - test-driven-development
   - verification-before-completion
   - receiving-code-review

📁 coordination (2 skills)
   - dispatching-parallel-agents
   - subagent-driven-development

📁 meta (2 skills)
   - using-superpowers
   - skill-router

Total: 14 skills in 5 categories
```

## Detailed View

Use with category to see full details:

```
> /myskills:list --category meta

📁 Category: meta

1. using-superpowers
   Introduction to the skills system
   Triggers: [superpowers, skills, how to use]

2. skill-router
   Intelligent skill discovery and routing
   Triggers: [find skill, which skill, search skills]
```

## See Also

- `/myskills:search` - Search with keywords
- `/myskills:route` - Auto-select best skill
