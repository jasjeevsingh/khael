# Khael

**A gentle adventure for curious minds.**

Khael is a free, browser-based developmental screening activity for children aged 2–6 years (24–72 months). It presents five short, play-based tasks and gives parents a descriptive summary of how their child engaged—along with educational resources and guidance. It is **not** a diagnostic tool, a clinical assessment, or a substitute for professional evaluation.

---

## Features

- **Privacy-first:** No data collected, stored, or transmitted. Everything runs in the browser; session state lives only in memory and is discarded when the tab closes.
- **No camera or microphone:** The activity is entirely tap/click and visual.
- **Child-friendly:** A storybook aesthetic with Noor the bear as a guide, soft colors, and gentle animations.
- **Parent-facing results:** A profile label, pentagon radar chart, pillar-by-pillar descriptions, and tailored “what this means” guidance (including when to talk to a pediatrician).
- **Educational resources:** A Learn section with topics on milestones, intellectual disability, the evaluation process, and supporting your child at home—personalized when results are available.

---

## Tech Stack

| Layer        | Choice                          |
|-------------|----------------------------------|
| Framework   | React 19                         |
| Build       | Vite 7                           |
| Styling     | Plain CSS + CSS Modules (no Tailwind) |
| State       | React Context + `useState` (in-memory only) |
| Backend     | None                             |
| Deploy      | Static host (e.g. Vercel, Netlify, GitHub Pages) |

**Dependencies:** `react`, `react-dom`. **Dev:** `vite`, `@vitejs/plugin-react`, `playwright`.

---

## Project Structure

```
khael/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json              # SPA rewrites for Vercel
├── src/
│   ├── main.jsx
│   ├── App.jsx              # Screen router (landing | setup | game | results)
│   ├── App.css              # Global styles, CSS variables
│   ├── state/
│   │   └── gameState.jsx    # Central state + updaters (no persistence)
│   ├── engine/              # Pure scoring/psychometrics (no UI)
│   │   ├── irt.js           # 3PL IRT: theta estimation, item selection
│   │   ├── scoring.js       # Pillar scores, CCI, profile classification
│   │   ├── driftDiffusion.js# DDM-style speed–accuracy summary
│   │   └── consistency.js   # ITV, engagement decay / fatigue
│   ├── components/
│   │   ├── Noor/            # Noor the bear (SVG, moods, optional bubble)
│   │   ├── JourneyMap/      # 5-stop progress map (full + compact)
│   │   ├── ProgressTrail/  # 5-dot module indicator
│   │   ├── RadarChart/     # Pentagon radar chart (scores + reference)
│   │   ├── Feedback/       # Correct/incorrect feedback UI
│   │   ├── Particles/      # Decorative particles
│   │   └── Tutorial/       # Per-module tutorial overlay
│   ├── screens/
│   │   ├── Landing/        # Hero, how it works, disclaimer, Learn anchor, footer
│   │   ├── Setup/          # Age, language, conditions, consent → start game
│   │   ├── Game/           # Module orchestrator, transitions, tutorials
│   │   │   ├── Transition.jsx
│   │   │   └── modules/
│   │   │       ├── BerryBasket.jsx   # Working Memory (WM)
│   │   │       ├── FallingLeaves.jsx # Processing Speed (PS)
│   │   │       ├── SleepingFox.jsx   # Inhibitory Control (EF)
│   │   │       ├── BridgeBuilder.jsx # Visuospatial (VS)
│   │   │       └── FeelingForest.jsx # Social Cognition (SC)
│   │   ├── Results/        # Profile, radar, pillar cards, follow-up, Learn, print
│   │   │   ├── PillarCard.jsx
│   │   │   └── PrintSummary.jsx
│   │   └── Learn/          # Expandable educational topics + personalized tips
│   └── data/
│       ├── milestones.js       # Developmental milestones by age
│       ├── educationalContent.js # Learn section copy (4 topics)
│       ├── scoreTemplates.js   # Pillar names + band language (strong/typical/emerging/needs_support)
│       ├── pillarResources.js  # Quick tips + when-to-seek per pillar
│       └── bridgeItems.js      # Pre-generated pattern items (Bridge Builder)
```

---

## Application Flow

1. **Landing** — Parent reads about Khael, can “Begin Noor’s Adventure” or “Jump to Learning Resources.”
2. **Setup** — Parent selects child’s age band (2–6), primary language, optional conditions (e.g. autism, hearing/vision), and consents. No names or PII.
3. **Game** — Child completes five modules in order. Each module has a short transition and optional tutorial, then the activity. Module results (theta, trials, RTs, etc.) are passed to the scoring engine.
4. **Results** — After the fifth module, the app computes pillar scores, CCI, consistency, fatigue/reliability flags, and a profile (e.g. “Noor’s Bright Star”, “Noor’s Thoughtful Traveler”). Parent sees radar chart, pillar cards, “What This Means,” and can print a summary or scroll to Learning Resources.

---

## Five Pillars (Modules)

| Module         | Pillar              | Key | Brief description                          |
|----------------|----------------------|-----|-------------------------------------------|
| Berry Basket   | Working Memory       | WM  | Remember and repeat berry color sequences |
| Falling Leaves | Processing Speed     | PS  | Tap leaves before they disappear          |
| Sleeping Fox   | Inhibitory Control   | EF  | Avoid tapping when fox is “sleeping”      |
| Bridge Builder | Visuospatial         | VS  | Complete visual patterns                  |
| Feeling Forest | Social Cognition     | SC  | Match faces to emotions                    |

Scoring uses a 3PL IRT-style model (per module), with theta mapped to a 0–100 display score. A Composite Cognitive Index (CCI) and consistency/fatigue checks feed into profile classification. Social Cognition can be excluded from CCI when autism is reported.

---

## Development

### Prerequisites

- Node.js 18+
- npm (or yarn/pnpm)

### Commands

```bash
# Install dependencies
npm install

# Run dev server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Environment

No environment variables are required. The app does not call any backend; only Google Fonts are loaded from the CDN (see `index.html`).

---

## Deployment

- **Vercel:** `vercel.json` is set up with `outputDirectory: "dist"` and SPA rewrites so all routes serve `index.html`.
- **Other static hosts:** Run `npm run build`, then deploy the `dist/` folder. Configure the host to serve `index.html` for all paths (client-side routing).

---

## Design System

- **Colors (CSS variables in `App.css`):** Warm cream background (`--bg`), deep sage primary (`--primary`), terracotta accent (`--accent`), pale mint (`--soft`), dark/light text, soft amber for warning.
- **Typography:** Fraunces (display/headings), DM Sans (body/UI), Nunito (game elements). Loaded via Google Fonts in `index.html`.
- **Motion:** Fades and soft bounces; no jarring animations.

---

## Important Disclaimers

- Khael is **not** a diagnostic tool. It does not produce a diagnosis and is not a substitute for a clinical evaluation.
- It is not standardized, normed, or validated against clinical instruments.
- Results are descriptive feedback about how the child engaged during play, intended as a starting point for conversation with a pediatrician when appropriate.

---

## License

See repository license file if present; otherwise assume project-specific terms.
