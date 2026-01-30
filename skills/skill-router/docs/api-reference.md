# API Reference

Complete API documentation for skill-router.

## Table of Contents

- [Core Functions](#core-functions)
- [Configuration Functions](#configuration-functions)
- [Indexer Functions](#indexer-functions)
- [Watcher Functions](#watcher-functions)
- [Plugin Integration](#plugin-integration)
- [CLI Commands](#cli-commands)

## Core Functions

### `searchSkills(query, options)`

Search for skills with ranking.

```javascript
import { searchSkills } from 'skill-router';

const results = searchSkills("debug issue", { limit: 3 });
// → [{ id: "systematic-debugging", score: 105, ... }, ...]
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Intent or keywords |
| `options.limit` | number | 5 | Max results |
| `options.category` | string | null | Filter by category |
| `options.projectSkillsDir` | string | null | Additional skill directory |

**Returns:** `Array<{ id, name, description, category, score, path }>`

---

### `routeSkill(intent, options)`

Automatically select the best skill for an intent.

```javascript
import { routeSkill } from 'skill-router';

const best = routeSkill("fix a failing test");
// → { skill: {...}, confidence: 0.95, command: 'use_skill("systematic-debugging")' }
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `intent` | string | required | What you want to accomplish |
| `options.projectSkillsDir` | string | null | Additional skill directory |

**Returns:** `{ skill, confidence, action, command }` or `null`

---

### `listCategories(projectSkillsDir)`

List all skill categories.

```javascript
import { listCategories } from 'skill-router';

const categories = listCategories();
// → [{ category: "technique", count: 3, skills: [...] }, ...]
```

**Returns:** `Array<{ category, count, skills }>`

---

### `getSkillDetails(skillId, projectSkillsDir)`

Get full skill content and metadata.

```javascript
import { getSkillDetails } from 'skill-router';

const skill = getSkillDetails("superpowers:systematic-debugging");
```

**Returns:** Skill object with content, or `null`

---

### `getIndex(projectSkillsDir)`

Get the full skill index (cached).

```javascript
import { getIndex } from 'skill-router';

const index = getIndex();
console.log(`Loaded ${Object.keys(index.skills).length} skills`);
```

**Returns:** `{ skills, keywords, categories, version }`

---

### `invalidateCache()`

Manually clear the cached index.

```javascript
import { invalidateCache, getIndex } from 'skill-router';

invalidateCache();
const freshIndex = getIndex(); // Rebuilds from filesystem
```

---

## Configuration Functions

### `getConfig()`

Get merged configuration (preset + user config).

```javascript
import { getConfig } from 'skill-router';

const config = getConfig();
// → { preset: "claude-code", skillDirs: [...], pluginCacheDirs: [...], language: "en" }
```

**Returns:** Configuration object

---

### `getSkillDirs()`

Get resolved skill directories from config.

```javascript
import { getSkillDirs } from 'skill-router';

const dirs = getSkillDirs();
// → [{ basePath: "/Users/me/.claude/skills", namespace: null }, ...]
```

**Returns:** `Array<{ basePath, namespace }>`

---

### `getPresets()`

Get available preset names.

```javascript
import { getPresets } from 'skill-router';

const presets = getPresets();
// → ["claude-code", "codex", "opencode", "all", "custom"]
```

---

### `getPreset(name)`

Get preset configuration by name.

```javascript
import { getPreset } from 'skill-router';

const preset = getPreset("claude-code");
// → { skillDirs: [...], pluginCacheDirs: [...] }
```

---

### `invalidateConfigCache()`

Clear cached configuration (for hot reload).

```javascript
import { invalidateConfigCache } from 'skill-router';

invalidateConfigCache();
```

---

## Indexer Functions

### `buildSkillIndex(skillDirs)`

Build skill index from directories.

```javascript
import { buildSkillIndex } from 'skill-router';

const index = buildSkillIndex([
  { basePath: '/path/to/skills', namespace: null }
]);
```

**Returns:** `{ skills, keywords, categories }`

---

### `extractFrontmatter(content)`

Extract YAML frontmatter from skill content.

```javascript
import { extractFrontmatter } from 'skill-router';

const { frontmatter, content } = extractFrontmatter(skillContent);
```

---

### `extractKeywords(text)`

Extract keywords from text with synonym expansion.

```javascript
import { extractKeywords } from 'skill-router';

const keywords = extractKeywords("debug failing test");
// → ["debug", "failing", "test", "fix", "bug", ...]
```

---

### `findSkillFiles(dir, maxDepth)`

Find all SKILL.md files in directory (follows symlinks).

```javascript
import { findSkillFiles } from 'skill-router';

const skills = findSkillFiles('/path/to/skills', 3);
// → [{ id: "my-skill", path: "/path/to/skills/my-skill", ... }, ...]
```

---

## Watcher Functions

### `startWatching(options)`

Start monitoring skill directories for changes.

```javascript
import { startWatching } from 'skill-router';

const watcher = startWatching({
  projectSkillsDir: '.claude/skills',
  pollInterval: 60000,
  enableFileWatch: true,
  enableGitCheck: false,
  debounceMs: 500,

  onChange: (changes) => {
    console.log('Added:', changes.added);
    console.log('Updated:', changes.updated);
    console.log('Removed:', changes.removed);
  },

  onGitUpdates: (updates) => {
    console.log('Git updates available:', updates);
  }
});
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `projectSkillsDir` | string | null | Project skills path |
| `pollInterval` | number | 60000 | Polling interval in ms |
| `enableFileWatch` | boolean | true | Enable fs.watch |
| `enableGitCheck` | boolean | false | Check for remote updates |
| `debounceMs` | number | 500 | Debounce delay |
| `onChange` | function | null | Callback when skills change |
| `onGitUpdates` | function | null | Callback when git updates available |

**Returns:** SkillWatcher instance

---

### `stopWatching()`

Stop all watchers.

```javascript
import { stopWatching } from 'skill-router';

stopWatching();
```

---

### `SkillWatcher` class

Low-level watcher class for custom implementations.

```javascript
import { SkillWatcher } from 'skill-router';

const watcher = new SkillWatcher(options);
watcher.start();
watcher.stop();
```

---

## Plugin Integration

### `SkillRouterPlugin`

Claude Code plugin integration.

```javascript
// .claude/plugin/skill-router.js
import { SkillRouterPlugin } from 'skill-router/plugin';

export default SkillRouterPlugin;
```

Provides tools:
- `route_skill(intent)` - Auto-route to best skill
- `search_skills(query, limit)` - Search with ranking
- `list_skill_categories()` - List categories
- `get_skill_details(skill_id)` - Get skill content

---

## CLI Commands

### `skill-router search <query>`

Search for skills by keyword.

```bash
skill-router search "debug"
skill-router search "test" --limit 3
skill-router search "feature" --json
```

**Options:**
- `--limit, -l <n>` - Limit results (default: 5)
- `--project, -p <dir>` - Add project skills directory
- `--json` - Output as JSON
- `--lang <en|zh>` - Language (default: en)

---

### `skill-router route <intent>`

Auto-route to best skill based on intent.

```bash
skill-router route "fix a bug"
skill-router route "create new feature" --json
```

---

### `skill-router list`

List all skill categories.

```bash
skill-router list
skill-router list --json
```

---

### `skill-router detail <skill-id>`

Show skill details.

```bash
skill-router detail systematic-debugging
skill-router detail superpowers:brainstorming --json
```

---

### `skill-router config`

Show current configuration.

```bash
skill-router config
skill-router config --json
```

---

## Configuration File

Create `~/.skill-router.json` or `./.skill-router.json`:

```json
{
  "preset": "claude-code",
  "language": "en",
  "skillDirs": [
    { "path": "/custom/skills", "namespace": "custom" }
  ]
}
```

**Available presets:**
- `claude-code` - Claude Code directories + plugin cache
- `codex` - Codex directories
- `opencode` - OpenCode directories
- `all` - All supported tools
- `custom` - Only custom directories

---

## Scoring Algorithm

Each skill is scored against the query:

| Signal | Score |
|--------|-------|
| Exact name match | +100 |
| Partial name match | +50 |
| Trigger word match | +30 |
| Keyword overlap | +10 per keyword |
| Description contains query | +20 |
| Description contains keyword | +5 per keyword |

**Confidence mapping:**
| Score Range | Confidence | Recommendation |
|-------------|------------|----------------|
| 70+ | HIGH | Load immediately |
| 40-69 | MEDIUM | Consider alternatives |
| 10-39 | LOW | Weak match |
| <10 | NONE | No relevant skill |
