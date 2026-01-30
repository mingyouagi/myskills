---
name: route
description: Route to the best skill for a given intent
usage: /myskills:route <intent>
---

# Route Skill Command

Find the best skill for a given intent using semantic search and routing.

## Usage

```
/myskills:route debug failing test
/myskills:route create new feature
/myskills:route fix a bug
```

## How It Works

1. Takes your intent as input
2. Searches through all available skills
3. Scores each skill based on:
   - Name match (+100 for exact, +50 for partial)
   - Trigger word match (+30)
   - Keyword overlap (+10 per keyword)
   - Description match (+20)
4. Returns the best matching skill with confidence score

## Output

Returns:
- **skill**: The recommended skill
- **confidence**: 0.0 - 1.0 confidence score
- **command**: Ready-to-use command to invoke the skill

## Example

```
> /myskills:route debug failing test

Routing result:
  Skill: systematic-debugging
  Confidence: 95%
  Command: use_skill("superpowers:systematic-debugging")
```

## When to Use

- When you have many skills and don't know which one to use
- When you want to quickly find the right tool for a task
- When exploring available capabilities

## See Also

- `/myskills:search` - Search skills with more control
- `/myskills:list` - Browse skills by category
