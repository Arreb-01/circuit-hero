# Contributing to Circuit Hero

Thank you for your interest in contributing! This guide covers the basics.

## Development Setup

```bash
# Install dependencies
npm install

# Start local server (http://127.0.0.1:3000)
npm start

# Run unit tests
npm test

# Run end-to-end tests (requires Chromium)
npm run test:e2e
```

## Project Conventions

### Code Style

- **JavaScript**: ES6+ with IIFE module pattern. No build step.
- **CSS**: BEM-inspired naming. Design tokens in `css/variables.css`.
- **HTML**: One page per file. Scripts loaded in dependency order (data → game → components → pages).

### File Organization

```
js/
  components/   → Reusable UI components (tutorial, onboarding, ui-fixes)
  data/         → Data layer (config, storage, API client)
  game/         → Game engine (circuit validation, physics, rendering)
  pages/        → Page-specific initialization scripts
css/
  variables.css → Design tokens (edit here for theme changes)
  base.css      → Layout, utilities
  components.css → Shared component styles
  *.css         → Page-specific styles
```

### Adding a New Level

1. Add the level config to `js/data/level-config.js`
2. Add a circuit-engine validation branch if the level uses a new topology
3. Add unit tests in `tests/circuit-engine.test.js`
4. Add a chapter node in `story-map.html`
5. Add level-specific hint text in `js/pages/workbench.js` `onHint()`

### Commit Messages

Use clear, descriptive messages:

- `feat: add level 7-1 capacitor challenge`
- `fix: series validation rejects valid parallel topology`
- `style: responsive workbench panels on tablet`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commits
3. Ensure `npm test` passes
4. Open a PR with a description of the changes

## Reporting Issues

Open a GitHub issue with:

- Steps to reproduce
- Expected vs. actual behavior
- Browser and OS information
