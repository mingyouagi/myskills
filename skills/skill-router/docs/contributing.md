# Contributing to Skill Router

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/skill-router.git`
3. Install dependencies: `npm install`
4. Run tests: `npm test`

## Development Workflow

### Project Structure

```
skill-router/
├── src/
│   ├── cli.js       # Command-line interface
│   ├── core.js      # Shared routing logic
│   ├── indexer.js   # Index building + keyword extraction
│   ├── router.js    # Standalone API with caching
│   ├── plugin.js    # Claude Code plugin integration
│   ├── watcher.js   # Auto-discovery (file watch + polling)
│   └── index.js     # Main exports
├── tests/
│   ├── search.test.js   # Search/routing tests
│   ├── index.test.js    # Indexer tests
│   └── watcher.test.js  # Watcher tests
├── docs/            # Documentation
├── examples/        # Usage examples
├── SKILL.md         # Meta-skill documentation
├── README.md        # Quick start guide
└── package.json     # Package configuration
```

### Making Changes

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test your changes: `npm test`
4. Commit with clear messages: `git commit -m "Add: amazing feature"`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Commit Convention

Use semantic prefixes:
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Modify existing feature
- `Remove:` Delete code/feature
- `Docs:` Documentation only
- `Test:` Test-related changes
- `Refactor:` Code restructuring

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run with coverage:
```bash
npm run test:coverage
```

### Code Style

- Use 2 spaces for indentation
- Prefer `const` over `let`, avoid `var`
- Use descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

## What to Contribute

### High Priority

- [ ] Bug fixes (especially edge cases)
- [ ] Performance improvements
- [ ] Documentation improvements
- [ ] More test coverage
- [ ] Real-world usage examples

### Feature Ideas

- [ ] Embedding-based semantic search
- [ ] Skill dependency graph
- [ ] Usage analytics
- [ ] Web UI for skill browsing
- [ ] Multi-language support (non-English skills)

### Not Currently Needed

- Breaking changes without strong justification
- Dependencies on large libraries (keep it lightweight)
- Features that duplicate existing functionality

## Reporting Issues

When reporting bugs, please include:

1. **Environment**: Node version, OS, skill count
2. **Steps to reproduce**: Minimal code example
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Error messages**: Full stack traces if applicable

Example:
```markdown
**Environment**: Node v18.0.0, macOS, 20 skills

**Reproduce**:
```javascript
const result = searchSkills("nonexistent");
console.log(result);
```

**Expected**: Empty array `[]`
**Actual**: Throws error

**Error**:
```
TypeError: Cannot read property 'keywords' of undefined
  at searchSkills (skill-router.js:72)
```
```

## Questions?

- Open an issue for questions
- Check existing issues first to avoid duplicates
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
