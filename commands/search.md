---
name: search
description: Search for skills matching a query
usage: /myskills:search <query> [--limit N] [--category CAT]
---

# Search Skills Command

Search through all available skills with ranking and filtering.

## Usage

```
/myskills:search debug
/myskills:search "create feature" --limit 5
/myskills:search testing --category technique
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--limit N` | Maximum number of results | 5 |
| `--category CAT` | Filter by category | all |

## Output

Returns a ranked list of skills with:
- **id**: Skill identifier
- **name**: Display name
- **description**: What the skill does
- **category**: Skill category
- **score**: Relevance score

## Example

```
> /myskills:search debug --limit 3

Search results for "debug":

1. systematic-debugging (score: 105)
   Category: technique
   Use when encountering bugs, test failures, or unexpected behavior

2. verification-before-completion (score: 45)
   Category: discipline
   Ensure changes are actually working before declaring success

3. test-driven-development (score: 30)
   Category: discipline
   RED-GREEN-REFACTOR development cycle
```

## Categories

Common categories include:
- `technique` - Debugging, algorithms, patterns
- `process` - Workflows, planning
- `discipline` - TDD, verification, best practices
- `coordination` - Multi-agent workflows
- `meta` - Skills about skills

## See Also

- `/myskills:route` - Auto-select the best skill
- `/myskills:list` - Browse all categories
