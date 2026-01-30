# Contributing to My Skills

Thank you for your interest in contributing! 🎉

## Ways to Contribute

### 🐛 Report Bugs

Found a bug? [Open an issue](../../issues/new) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, OS, etc.)

### 💡 Suggest New Skills

Have an idea for a new skill? Great! [Open an issue](../../issues/new) with:
- **Problem**: What problem does it solve?
- **Solution**: How would it work?
- **Use case**: When would agents use it?
- **API design**: Basic interface sketch

### 🔧 Improve Existing Skills

Want to enhance a skill? 
1. Check existing issues for planned improvements
2. Open an issue to discuss major changes
3. For minor fixes, submit a PR directly

### 📖 Enhance Documentation

Documentation improvements are always welcome:
- Fix typos or unclear explanations
- Add usage examples
- Improve API documentation
- Translate to other languages

## Development Workflow

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/myskills.git
cd myskills

# Install dependencies for a specific skill
cd skills/skill-router
npm install
```

### Making Changes

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation

3. **Test your changes**
   ```bash
   # For skill-router
   cd skills/skill-router
   npm test
   ```

4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "Add: feature description"
   # or
   git commit -m "Fix: bug description"
   ```

   Use semantic prefixes:
   - `Add:` New feature
   - `Fix:` Bug fix
   - `Update:` Modify existing feature
   - `Remove:` Delete code/feature
   - `Docs:` Documentation only
   - `Test:` Test-related changes
   - `Refactor:` Code restructuring

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub.

## Creating a New Skill

### 1. Structure

Create a new directory under `skills/`:

```
skills/your-skill-name/
├── src/              # Source code
├── tests/            # Unit tests
├── examples/         # Usage examples
├── SKILL.md          # Claude Code skill file (with frontmatter)
├── README.md         # Skill documentation
├── package.json      # npm configuration
└── LICENSE           # MIT (or compatible)
```

### 2. SKILL.md Format

Every skill MUST have a `SKILL.md` with frontmatter:

```yaml
---
name: your-skill-name
description: Use when [clear trigger condition]
category: [meta|process|technique|discipline|coordination|lifecycle|quality]
triggers: [keyword1, keyword2, keyword3]
---

# Your Skill Name

## Problem Solved

[Clear problem statement]

## Solution

[How your skill solves it]

## Usage

[Usage examples]
```

### 3. README.md

Each skill needs its own README.md with:
- Quick start
- Installation instructions
- API reference
- Examples
- Contributing section

See [skill-router/README.md](./skills/skill-router/README.md) as a template.

### 4. Testing

- Use [vitest](https://vitest.dev/) for unit tests
- Aim for >80% code coverage
- Test edge cases
- Add integration tests for complex features

### 5. Documentation

- Add inline comments for complex logic
- Use JSDoc for public APIs
- Include usage examples
- Update main README.md to list your skill

## Code Style

### General Principles

- **Simple over clever**: Readable code beats clever code
- **Tested**: Every feature should have tests
- **Documented**: Public APIs need documentation
- **Consistent**: Follow existing patterns

### JavaScript/Node.js

- ES modules (`import`/`export`)
- Node 16+ features
- Prefer `const` over `let`, avoid `var`
- Use descriptive variable names
- 2 spaces for indentation

### File Organization

- One responsibility per file
- Group related functions
- Export from `src/index.js`
- Keep files under 300 lines

## Testing Guidelines

### What to Test

- ✅ Public API functions
- ✅ Edge cases and error conditions
- ✅ Integration between modules
- ✅ Examples in documentation

### What NOT to Test

- ❌ Third-party library internals
- ❌ Trivial getters/setters
- ❌ Private implementation details

### Test Structure

```javascript
import { describe, it, expect } from 'vitest';

describe('featureName', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Pull Request Process

1. **Update documentation** if you changed APIs
2. **Add/update tests** for your changes
3. **Run tests** and ensure they pass
4. **Update CHANGELOG** (if applicable)
5. **One PR per feature/fix** - keep them focused
6. **Respond to feedback** - reviews help improve code quality

### PR Title Format

```
[Skill Name] Type: Brief description

Examples:
- [skill-router] Add: Support for weighted keyword matching
- [skill-router] Fix: Cache invalidation race condition
- [core] Docs: Improve README examples
```

## Code Review

All submissions require review. We review for:
- Correctness (does it work?)
- Tests (is it tested?)
- Documentation (is it documented?)
- Style (does it match existing code?)
- Performance (is it efficient?)

## Community Guidelines

- Be respectful and constructive
- Help newcomers
- Assume good intentions
- Focus on the code, not the person
- Celebrate contributions

## Questions?

- 💬 Open a [Discussion](../../discussions)
- 🐛 Check existing [Issues](../../issues)
- 📧 Contact maintainers (see main README)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making My Skills better! 🚀
