# Circuit Hero

Story-driven circuit learning interactive website for ages 12-16. Players fix electronic devices for the residents of Circuit Town through 6 progressive chapters, learning closed circuits, series, parallel, and complex wiring.

> Course QHE6102 Interactive Media Design & Development — Team J

## Features

- **Story-driven gameplay**: Fix devices for town residents through character dialogue and scene-based missions
- **Drag-and-drop circuit builder**: Place batteries, bulbs, and switches on a grid, then connect with wires
- **Real-time circuit validation**: BFS-based engine detects closed, open, short circuits, series, parallel, and mixed topologies
- **Particle animation**: Watch current flow through your completed circuits with golden particle effects
- **Star rating system**: Earn 1-3 stars based on time and hint usage
- **Progress tracking**: Local + remote dual-channel storage with user accounts
- **Sandbox mode**: Free-build laboratory to experiment without constraints

## Quick Start

### Prerequisites

- **Node.js >= 22.5.0** (required for built-in `node:sqlite` module)
- npm >= 8.0.0

### Install and Run

```bash
# Install dependencies
npm install

# Start the server (Express API + static file serving)
npm start
```

The server starts at **http://127.0.0.1:3000**.

### Run Tests

```bash
# All unit tests (8 suites, zero external test framework)
npm test

# End-to-end browser test (requires Chromium installed)
npm run test:e2e
```

## How to Play

### User Flow

```
Homepage → Login/Register → Story Map → Mission Briefing → Workbench → Success!
```

1. **Homepage** (`index.html`) — Overview and entry point. Click "Try Demo" to skip login and jump to Level 1-1
2. **Login** (`login.html`) — Register a new account or log in. Credentials are stored in SQLite with bcrypt encryption
3. **Story Map** (`story-map.html`) — Chapter-select map. Chapters unlock sequentially as you complete each one
4. **Mission Briefing** (`mission-briefing.html`) — Scene illustration, character dialogue (typewriter effect), goal, available parts, and star target
5. **Workbench** (`workbench.html`) — The main circuit-building interface
6. **Sandbox** (`workbench.html?level=sandbox`) — Free-build mode with save/load/share

### Workbench Controls

| Action | How |
|--------|-----|
| Place a component | Drag from the left **Parts Bin** panel onto the grid |
| Connect a wire | Click a port (black circle on component), then click another port |
| Cancel a wire | Press `Escape` or click blank area while drawing |
| Toggle a switch | Click the placed switch on the grid |
| Delete last wire | Click the **Delete** button or press `Delete` key |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` |
| Test the circuit | Click **Power On!** button or press `Space` |
| Get a hint | Click the **Hint** button (costs -1 star) |
| Clear everything | Click **Clear All** (confirm dialog) |

### Star Rating

| Stars | Condition |
|-------|-----------|
| 3 stars | Completed within target time, no hints used |
| 2 stars | Completed but exceeded target time or used hints |
| 1 star | Completed with significant time or multiple hints |

### Sandbox Mode

Access via the **Sandbox** tab on the story map or navigate to `workbench.html?level=sandbox`.

- **Save Design** — Names and stores your circuit in localStorage
- **Load Design** — Browse and restore saved designs
- **Share Link** — Generates a URL that encodes your circuit for others to open

## Levels

| Level | Title | Circuit Type | Components | Key Concept |
|-------|-------|-------------|------------|-------------|
| 1-1 | First Light | Closed | 1 battery, 1 bulb | Current flows in a complete loop from (+) through the bulb back to (-) |
| 2-1 | Light Switch | Closed + switch | 1 battery, 1 bulb, 1 switch | A switch acts as a gate that opens or closes the circuit path |
| 3-1 | Two Lights, One Path | Series | 1 battery, 2 bulbs | Series: all bulbs share one path. Break one, break all |
| 4-1 | Branching Lights | Parallel | 1 battery, 2 bulbs | Parallel: each bulb has its own path to the battery |
| 5-1 | House Wiring | Mixed (parallel + series) | 1 battery, 3 bulbs, 3 switches | Master switch + room switches + hallway light in series |
| 6-1 | The Dark Theater | Hierarchical | 1 battery, 5 bulbs, 3 switches | Master switch, 3 stage lights in series, 2 audience lights in parallel |

## Project Structure

```
circuit-hero/
├── assets/
│   ├── icons/              # SVG icons (logo, arrows, tabs, etc.)
│   └── images/             # Scene illustrations and character portraits
├── css/
│   ├── variables.css       # Design tokens (colors, fonts, spacing, shadows)
│   ├── reset.css           # CSS reset
│   ├── base.css            # Base layout (.page-wrapper, .page-content, responsive padding)
│   ├── components.css      # Shared components (buttons, cards, pills, modals, onboarding)
│   ├── home.css            # Homepage hero section
│   ├── login.css           # Login/register page
│   ├── story-map.css       # Chapter-select map
│   ├── mission-briefing.css # Mission briefing layout
│   ├── workbench.css       # Workbench panels, stage, tools, success modal
│   └── profile.css         # User profile page
├── js/
│   ├── components/
│   │   ├── tutorial.js     # Sparky step-by-step tutorial (level 1-1 only)
│   │   └── onboarding-guide.js  # Cross-page onboarding overlay (level 1-1 only)
│   ├── data/
│   │   ├── level-config.js # Level definitions (goals, parts, scenes, dialogues, knowledge)
│   │   ├── progress-store.js # Progress storage (localStorage + API sync)
│   │   ├── profile-model.js  # User profile/badge logic
│   │   └── api-client.js   # HTTP client for backend API
│   ├── game/
│   │   ├── circuit-engine.js  # BFS-based circuit validation engine
│   │   ├── components.js   # Component CRUD (create, render, update, delete)
│   │   ├── drag-drop.js    # Drag from panel + move placed components
│   │   ├── wiring.js       # Port-click wire drawing with bezier curves
│   │   ├── wire-geometry.js # Bezier curve math and distance calculations
│   │   ├── grid.js         # Grid layout and snap-to-grid logic
│   │   ├── particle-system.js # Current flow particle animation
│   │   ├── success-feedback.js # Success modal, error messages, knowledge card
│   │   └── undo-redo.js    # Undo/redo operation stack
│   └── pages/
│       ├── home.js         # Homepage logic
│       ├── login.js        # Login/register form handling
│       ├── story-map.js    # Map node rendering and unlock logic
│       ├── mission-briefing.js # Dynamic briefing content loading
│       ├── workbench.js    # Main workbench controller (init, power, hint, sandbox)
│       └── profile.js      # User profile page
├── server/
│   ├── index.js            # Server entry point
│   ├── app.js              # Express app (auth, progress API, static serving)
│   └── db.js               # SQLite database initialization
├── tests/
│   ├── circuit-engine.test.js  # Circuit validation tests (all 6 levels + sandbox)
│   ├── particle-system.test.js # Particle path construction tests
│   ├── progress-store.test.js  # Progress storage tests
│   ├── wire-geometry.test.js   # Bezier curve math tests
│   ├── undo-redo.test.js       # Undo/redo stack tests
│   ├── profile-model.test.js   # User badge/title tests
│   ├── auth-api.test.js        # Authentication API tests
│   ├── sandbox-config.test.js  # Sandbox configuration tests
│   └── e2e-flow.js            # Playwright end-to-end flow test
├── docs/
│   ├── acceptance-checklist-and-improvements.md  # Audit checklist and improvement items
│   ├── backend-data-model.md   # Database schema documentation
│   └── requirements-completion-report.md  # Feature completion report
├── index.html              # Homepage
├── login.html              # Login/register
├── story-map.html          # Chapter map
├── mission-briefing.html   # Mission briefing
├── workbench.html          # Circuit workbench
├── profile.html            # User profile
└── package.json
```

## Architecture

### Frontend

Pure HTML/CSS/JavaScript with no build step or framework. Each page loads its own CSS modules and JS scripts in dependency order:

```
Data layer (level-config, api-client, progress-store)
  → Game layer (grid, components, drag-drop, wiring, circuit-engine, particles, feedback)
    → Components (tutorial, onboarding-guide)
      → Page script (home, workbench, etc.)
```

### Circuit Engine

The `CircuitEngine` uses BFS (breadth-first search) on a graph where nodes are `componentUid.portId` pairs and edges are either internal component connections (ports linked inside a component) or wires. Different validation branches:

- **closed**: Generic single-path validation
- **series**: All bulbs must be on the same single BFS path
- **parallel**: Each bulb must independently connect (+) to one bulb port and (-) to the other
- **houseWiring**: Tests switch states to verify master/room/hallway logic
- **theaterWiring**: Tests switch states to verify master/stage-series/audience-parallel logic

### Backend

Express server serving static files and providing a REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Authenticate and create session |
| `/api/progress` | GET | Fetch all level progress for logged-in user |
| `/api/progress/:levelId` | PUT | Save/update progress for a level |

Data is stored in SQLite with bcrypt-encrypted passwords and parameterized queries.

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Gold | `#FFD700` | Accent, stars, success, current flow |
| Warm Orange | `#FF8C42` | Interactive highlights, badges |
| Primary Dark | `#2A1F1A` | Text, dark buttons |
| Cream | `#FAF6EE` | Page background |
| Pixel Font | Press Start 2P | Labels, badges |
| Body Font | Noto Sans SC | All text |
| Terminal Font | VT323 | Status text, code-style elements |

## Tech Stack

- **Frontend**: HTML5, CSS3 (Flexbox, CSS Variables, Canvas API), ES6+ JavaScript
- **Backend**: Node.js, Express, SQLite (node:sqlite), bcryptjs
- **Testing**: Node.js assert module (zero-dependency unit tests), Playwright (E2E)

## License

MIT
