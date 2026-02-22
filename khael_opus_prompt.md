# Khael Free Tier — Full Project Build Prompt for Claude Opus 4.6 in Cursor

## YOUR MISSION

You are building a complete, production-ready web application called **Khael** — a free, browser-based developmental screening game for children aged 24–72 months (2–6 years), paired with educational resources for parents. You are working inside Cursor as an AI coding agent with full filesystem access. Build this as a proper multi-file project.

**Stack: React (Vite), plain CSS modules (no Tailwind), no backend, no authentication, no database.** All state is in-memory for the session. Deploy target is any static host (Vercel, Netlify, GitHub Pages).

**Scaffold the project first:**
```
khael/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css (global styles, CSS variables)
│   ├── state/
│   │   └── gameState.js          (central state object + updater functions)
│   ├── engine/
│   │   ├── irt.js                (3PL IRT model, theta update, b selection)
│   │   ├── scoring.js            (CCI, pillar normalization, profile classification)
│   │   ├── driftDiffusion.js     (DDM parameter estimation)
│   │   └── consistency.js       (ITV calculation, engagement decay detection)
│   ├── components/
│   │   ├── Noor/
│   │   │   └── Noor.jsx          (Noor the bear SVG component, animatable props)
│   │   ├── ProgressTrail/
│   │   │   └── ProgressTrail.jsx (5-dot module progress indicator)
│   │   └── RadarChart/
│   │       └── RadarChart.jsx    (SVG pentagon radar chart)
│   ├── screens/
│   │   ├── Landing/
│   │   │   ├── Landing.jsx
│   │   │   └── Landing.module.css
│   │   ├── Setup/
│   │   │   ├── Setup.jsx
│   │   │   └── Setup.module.css
│   │   ├── Game/
│   │   │   ├── Game.jsx               (module orchestrator)
│   │   │   ├── Game.module.css
│   │   │   ├── Transition.jsx         (between-module transition screen)
│   │   │   └── modules/
│   │   │       ├── BerryBasket.jsx    (Working Memory)
│   │   │       ├── FallingLeaves.jsx  (Processing Speed)
│   │   │       ├── SleepingFox.jsx    (Inhibitory Control)
│   │   │       ├── BridgeBuilder.jsx  (Visuospatial)
│   │   │       └── FeelingForest.jsx  (Social Cognition)
│   │   ├── Results/
│   │   │   ├── Results.jsx
│   │   │   ├── Results.module.css
│   │   │   ├── PillarCard.jsx
│   │   │   └── PrintSummary.jsx
│   │   └── Learn/
│   │       ├── Learn.jsx
│   │       └── Learn.module.css
│   ├── assets/
│   │   └── (SVG components go in /components or inline — no raster images)
│   └── data/
│       ├── milestones.js          (developmental milestone content)
│       ├── educationalContent.js  (all Learn section copy)
│       ├── scoreTemplates.js      (pillar × band language templates)
│       └── bridgeItems.js        (pre-generated pattern recognition item bank)
```

This is not a toy prototype. Every system described below must be fully implemented and functional. Read the entire prompt before writing a single line of code. Build all files completely — do not stub, do not leave TODOs, do not write placeholder components.

---

## AESTHETIC DIRECTION

This is a children's product, but the *parent* is also a user — they see the landing page, the results, and the educational resources. The design must work for both audiences simultaneously.

**Visual World:** Soft, illustrated storybook aesthetic. Think Scandinavian children's book illustration — clean shapes, warm muted palette, generous whitespace, gentle personality. NOT loud, NOT primary-color cartoon, NOT clinical.

**Color Palette (use CSS variables throughout):**
- Background: `#FDF6EC` (warm cream)
- Primary: `#4A7C6F` (deep sage green — the forest world)
- Accent: `#E8956D` (warm terracotta — warmth, action)
- Soft: `#B8D4C8` (pale mint — secondary elements)
- Text dark: `#2C3E35`
- Text light: `#6B7F78`
- Warning/concern: `#D4956A` (soft amber, never red)
- White: `#FFFFFF`

**Typography (load from Google Fonts via `<link>` in index.html):**
- Display/headings: `Fraunces` (serif, characterful, warm)
- Body/UI: `DM Sans` (clean, friendly, modern)
- Game elements: `Nunito` (rounded, child-appropriate)

**Motion:** Gentle. Page transitions fade. Game elements animate in with soft bounces. Results reveal with a staggered sequence. Nothing jarring. CSS keyframe animations throughout.

**The Game World Character:** A small bear named **Noor** (gender-neutral, warm name). Noor is illustrated in SVG — a simple, charming bear silhouette used consistently throughout the game. Noor guides the child through tasks.

**All SVG illustrations must be inline and hand-crafted** — simple geometric shapes composited into recognizable scenes. No placeholder boxes. No missing images. Every visual element must render.

---

## APPLICATION ARCHITECTURE

The app has four distinct screens, managed by JavaScript show/hide logic. Only one screen is visible at a time.

### Screen 1: Landing Page (Parent-Facing)
### Screen 2: Pre-Game Setup
### Screen 3: The Game (Child-Facing)
### Screen 4: Results + Educational Resources (Parent-Facing)

State is managed in a global JavaScript object. No localStorage. No cookies. No network requests except Google Fonts CDN load.

---

## SCREEN 1: LANDING PAGE

### Content

**Hero section:**
- Noor the bear SVG, illustrated warmly, centered or offset
- Headline: *"A gentle adventure for curious minds"*
- Subheadline: *"Khael is a free, play-based activity designed to give parents a starting point for understanding how their child thinks, learns, and grows. No cameras. No recordings. Just play."*
- CTA button: "Begin Noor's Adventure →" (leads to Screen 2)
- Secondary link: "Jump to Learning Resources ↓" (anchors to education section at bottom of landing page)

**Trust bar (3 icons with short labels):**
- 🔒 No data collected or stored
- 📵 No camera or microphone used
- 🎮 Designed to feel like a game

**How it works section (3 steps):**
1. *Tell us a little about your child* — just their age range, no names
2. *Noor goes on an adventure* — your child helps Noor through five short activities
3. *You receive a gentle summary* — a profile of how your child engaged, with guidance on next steps

**Honest framing section** (important — include this verbatim, styled warmly):
> *"Khael is not a diagnostic tool. It does not produce a diagnosis and it is not a substitute for a clinical evaluation by a qualified professional. What it does is give you a structured, thoughtful starting point — something to bring to your pediatrician if you have concerns, or simply a window into how your child engages with different types of thinking tasks. If the results suggest speaking with a professional, we'll tell you clearly and tell you exactly what to say."*

**Educational Resources Section** (anchor: `#learn`) — described in full under Screen 4 below. This section lives at the bottom of the landing page AND is accessible from the results screen.

**Footer:** "Khael | A developmental starting point, not a diagnosis | Free forever"

---

## SCREEN 2: PRE-GAME SETUP

This screen is parent-facing and must complete in under 60 seconds.

### Fields (minimal, no names, no PII):

**Age band selector** (large tap-friendly buttons, not a dropdown):
- "2 years" / "3 years" / "4 years" / "5 years" / "6 years"

**Primary language at home** (matters for task calibration):
- "English" / "Arabic" / "Other" (simple buttons)

**One question:** *"Does your child have any diagnosed conditions we should know about?"*
- "No" / "Yes — autism diagnosis" / "Yes — hearing difference" / "Yes — vision difference" / "Yes — other"
(This is used only to adjust confidence weights, not to change the game experience. A child with a known hearing difference should not have audio-dependent tasks scored.)

**Consent checkbox:** *"I confirm I am this child's parent or guardian, and I understand this activity is not a clinical assessment."*

**Begin button:** "Let's help Noor! →"

### Behind the scenes:
Store selections in global `state` object:
```javascript
const state = {
  ageBand: null,          // 2|3|4|5|6
  language: null,
  conditions: [],
  currentModule: 0,
  moduleResults: [],
  pillarScores: {},
  sessionStartTime: null,
  trialLog: []
}
```

Age band drives IRT difficulty initialization. A 2-year-old starts modules at difficulty parameter `b = -1.5` (easy). A 6-year-old starts at `b = 0.0` (medium). This is set per-module.

---

## SCREEN 3: THE GAME

### Global Game Architecture

The game has **5 modules** played sequentially. Each module targets a specific cognitive pillar. Between modules, Noor appears with a brief animated transition and a line of encouragement (displayed as a speech bubble, child-directed).

**Module order:**
1. The Berry Basket (Working Memory)
2. The Falling Leaves (Processing Speed + Sustained Attention)
3. The Sleeping Fox (Inhibitory Control / Go-No-Go)
4. The Bridge Builder (Visuospatial / Pattern Recognition — nonverbal IQ analog)
5. The Feeling Forest (Social Cognition — emotion recognition)

**Session length target:** 12–18 minutes total across all modules. Each module is 2.5–4 minutes.

**Global game UI elements:**
- Top: Noor's face (small, corner), a soft progress trail (5 dots, current one glowing)
- Bottom: Nothing — no score, no timer visible to child
- Background: Changes color/scene per module (berry field, forest canopy, forest floor, stone bridge, bright meadow)
- Sound: None (no audio required, no audio implemented)
- All instructions delivered as simple illustrated text + Noor's speech bubble. For ages 2-3, instructions are a single short sentence. For ages 4-6, slightly more complex.

**Adaptive IRT Engine (implement fully in JavaScript):**

Each module maintains:
```javascript
{
  theta: 0.0,           // current ability estimate (latent trait)
  b: initialDifficulty, // item difficulty parameter (age-initialized)
  a: 1.0,               // discrimination parameter
  c: 0.25,              // pseudo-guessing parameter (3PL model)
  responses: [],        // array of {correct, latency, difficulty}
}
```

After each trial, update theta using the 3-Parameter Logistic IRT model:

**Probability of correct response:**
```
P(correct | theta, b, a, c) = c + (1-c) / (1 + exp(-a * (theta - b)))
```

**Theta update (simplified EAP — Expected A Posteriori):**
After each response, compute the likelihood-weighted update:
- If correct and RT < expected: nudge theta up by `0.3 * (1 - P)`
- If correct and RT > 2x expected: nudge theta up by `0.15 * (1 - P)` (slow-correct = less signal)
- If incorrect: nudge theta down by `0.3 * P`
- Clamp theta to [-3, 3]

Next item difficulty:
```
b_next = theta + 0.1  // target items slightly above current estimate
```
Clamp b to [-2.5, 2.5].

**Response Time Processing:**
Every trial records:
- `rt`: response time in milliseconds (Date.now() delta)
- `rtNorm`: rt normalized against age-band expected RT baseline
  - Age 2: baseline 2200ms, Age 3: 1800ms, Age 4: 1400ms, Age 5: 1100ms, Age 6: 900ms
- `deviation`: pixel distance from tap to target center (for touch/click coordinate capture)

**Inter-Trial Variability (ITV) calculation:**
After each module, compute coefficient of variation of RT:
```
ITV = stddev(rts) / mean(rts)
```
High ITV (>0.6) flags attentional inconsistency. Store per module.

**Drift-Diffusion Model Parameters (compute post-module):**
From the RT distribution, estimate:
- `v` (drift rate): `mean_accuracy / mean_rt_normalized` — proxy for evidence accumulation quality
- `a_bound` (boundary): `1 / ITV` — proxy for response caution
These are stored as additional features alongside theta.

**Engagement Decay Detector:**
Track rolling mean RT over last 3 trials. If RT increases >40% above module baseline AND accuracy drops below 40% simultaneously: flag as `engagementFatigued = true` for that module and log it. Do not end the module early, but weight subsequent trials at 0.7.

---

### MODULE 1: THE BERRY BASKET (Working Memory)

**Narrative:** "Noor needs to remember which berries to collect before crossing the river! Can you help?"

**Mechanic:** A sequence of colored berry icons lights up one at a time on screen (SVG berries: red, blue, yellow, purple). After the sequence completes, they all go dark. The child taps them in the correct order on lily pad targets that appear.

**SVG Requirements:**
- Animated river scene background (CSS animation — gentle wave motion)
- 4 berry types as distinct SVG icons (circle with leaf, different colors)
- Lily pad targets: green oval SVGs that pulse gently when it's time to tap

**Sequence length (IRT-driven):**
- Starting sequence: age-band mapped (age 2: 2 items, age 3: 3, age 4-5: 4, age 6: 5)
- Each correct trial: b increases (longer sequence next)
- Each incorrect: b decreases (shorter sequence next)

**Trial count:** 8–12 trials (stop at 12 or when theta SE < 0.3, whichever first)

**Scoring per trial:**
- correct: binary (all items in correct order = 1, any error = 0)
- latency: time from last berry disappearing to first tap
- error type: record which position failed (primacy/recency errors are meaningful)

**Between-trial pause:** 800ms blank, then Noor bounces and next sequence starts.

**Pillar output:** `theta_WM`, `ITV_WM`, `v_WM`, primacy/recency error ratio

---

### MODULE 2: THE FALLING LEAVES (Processing Speed + Sustained Attention)

**Narrative:** "Leaves are falling! Help Noor catch the ones with a star ⭐ before they hit the ground!"

**Mechanic:** Leaves fall from top of screen at varying speeds. Some have a star (targets), some don't (distractors). Child taps targets. Leaves are SVG animated with CSS `@keyframes` translateY.

**SVG Requirements:**
- Forest canopy background (layered green arches, CSS)
- Leaf SVGs: simple maple-leaf shapes in orange/red/yellow
- Star leaves: same leaf with a small ⭐ overlay
- Ground: soft brown rectangle at bottom
- Leaves that reach the ground "crumple" (CSS scale to 0 animation)

**Parameters (IRT-driven):**
- Fall speed: starts slow (age-appropriate), increases with theta
- Number of simultaneous leaves: 1–3 depending on difficulty
- Target:distractor ratio: 50/50 always (to measure false positives)
- Window to tap: 2500ms at easy, 1500ms at hard

**Trial:** Each leaf appearance is one trial opportunity.
**Trial count:** 30–40 leaf appearances over ~3 minutes

**Scoring per trial:**
- Hit (star leaf tapped): +1 correct
- Miss (star leaf not tapped): 0, record as omission error
- False alarm (plain leaf tapped): record as commission error
- RT: time from leaf appearance to tap

**Key metrics:**
- Hit rate, false alarm rate, d-prime (signal detection theory): `d' = Z(hit_rate) - Z(false_alarm_rate)`
- d-prime is a bias-free measure of perceptual sensitivity — compute and store this
- ITV of hit RTs

**Pillar output:** `theta_PS`, `d_prime`, `commission_rate`, `omission_rate`, `ITV_PS`

---

### MODULE 3: THE SLEEPING FOX (Inhibitory Control / Go-No-Go)

**Narrative:** "Shhh! The fox is sleeping. Tap the drum when the fox's eyes are CLOSED. But freeze — don't tap when the eyes are OPEN or you'll wake it!"

**Mechanic:** A fox face SVG alternates between eyes-closed (GO) and eyes-open (STOP) states. The child must tap a drum icon when eyes are closed, and do nothing when eyes are open.

**SVG Requirements:**
- Forest floor background (mossy ground, tree roots)
- Fox face SVG: simple geometric fox (triangular ears, snout, eyes that animate open/closed with CSS)
- Eye state changes are CSS class toggles (`.eyes-open` / `.eyes-closed`) with smooth CSS transition
- Drum SVG in bottom center — pulses when tappable

**Parameters:**
- GO duration: 1200ms at easy, 800ms at hard
- STOP duration: 600ms at easy, 400ms at hard
- Ratio: 70% GO trials, 30% STOP trials (standard Go/No-Go)
- ISI (inter-stimulus interval): 400–600ms random

**Trial count:** 40 trials

**Scoring:**
- Correct GO (tapped during GO): record RT
- Commission error (tapped during STOP): record, penalize theta
- Omission error (did not tap during GO): record, penalize theta less severely
- Post-error slowing: track whether RT increases after a commission error (this is an executive function marker — children with strong inhibitory control slow down after errors)

**Key metrics:**
- Commission error rate (primary inhibitory control marker)
- Omission error rate (attention/engagement marker)
- Mean GO RT
- Post-error RT ratio: `RT_after_error / mean_RT` — if > 1.15, flag as adaptive (good sign)

**Pillar output:** `theta_EF`, `commission_rate_EF`, `post_error_slowing`, `ITV_EF`

---

### MODULE 4: THE BRIDGE BUILDER (Visuospatial / Pattern Recognition)

**Narrative:** "The bridge has missing stones! Help Noor cross by finding the stone that fits the pattern."

**Mechanic:** A horizontal bridge SVG with a gap. Above the gap: a pattern sequence of shape/color tiles (3–5 tiles shown, one missing). Below: 4 answer tiles, one correct. Child taps the correct tile.

**This is your Raven's Progressive Matrices analog. It must be properly implemented.**

**Pattern types (difficulty-ordered):**
1. Color sequence (red, blue, red, ?, red → blue) — simplest
2. Shape sequence (circle, square, circle, ?, circle → square)
3. Size sequence (big, small, big, ?, big → small)
4. Color+shape combined (red circle, blue square, red circle, ? → blue square)
5. Rotation/orientation sequence (arrow pointing right, down, right, ? → down)
6. Two-attribute alternation (big red, small blue, big red, ? → small blue)
7. Three-attribute progression (hardest — shape+color+size all changing)

**Item bank:** Pre-generate 30 items across these 7 types, ordered by difficulty. IRT selects from this bank based on current b parameter.

**SVG Requirements:**
- Stone bridge background with gap
- Pattern tiles: SVG shapes (circles, squares, triangles, stars) in defined colors
- Answer choices: 4 tiles arranged in 2x2 grid below bridge
- Correct answer position: randomized each trial
- Hover/tap feedback: selected tile highlights, then brief correct/incorrect animation

**Trial count:** 10–14 trials

**Scoring:**
- Correct: binary
- RT: time from answer options appearing to tap
- Distractor type chosen: record which wrong answer (systematic wrong answers reveal reasoning patterns)

**Pillar output:** `theta_VS`, `highest_pattern_type_solved`, `ITV_VS`

---

### MODULE 5: THE FEELING FOREST (Social Cognition / Emotion Recognition)

**Narrative:** "Noor's friends in the forest are feeling different things. Can you help Noor understand how each friend is feeling?"

**Mechanic:** A scene appears showing an animal character in a clear emotional situation (SVG illustrated). Four emotion face options appear below. Child taps the correct emotion.

**Emotion set:** Happy, Sad, Scared, Angry, Surprised (basic emotion set validated in developmental literature)

**Scene types (difficulty-ordered):**
1. Face only — animal with clear exaggerated happy/sad expression (simplest)
2. Face + context — animal face + simple contextual cue (birthday cake = happy)
3. Context only — situation without clear face (dropped ice cream, no face shown)
4. Ambiguous context — situation that could be multiple emotions (getting a gift — happy or surprised?)
5. Two-character scenes — one character doing something to another, identify recipient's feeling
6. Retrospective — "What did the bear feel BEFORE this happened?" (requires temporal reasoning)

**SVG Requirements:**
- Meadow/forest background
- Animal characters: simple SVG animals (bear, rabbit, bird) with expressive faces using basic geometric eye/mouth shapes
- Emotional face options: 4 round SVG faces with distinct expressions (eyebrow angles, mouth curves)
- Clear, high-contrast expression differences

**Trial count:** 10–12 trials

**Note on scoring for conditions:** If parent indicated hearing or vision difference, weight this module's theta at 0.8 in the synthesis. If autism diagnosis indicated, do not include this pillar score in the overall summary (it would be confounded) — still run the module for engagement but flag in output.

**Pillar output:** `theta_SC`, `highest_scene_type_solved`, `emotion_confusion_matrix` (which emotions were confused with which)

---

### BETWEEN-MODULE TRANSITIONS

Between each module, show a full-screen transition:
- Noor the bear in the center, animated (gentle bounce CSS)
- A speech bubble with one of these lines (cycle through):
  - "You're so good at this! Ready for the next adventure?"
  - "Wow! Noor loves having you as a helper!"
  - "Almost there — let's see what's next in the forest!"
  - "You're amazing! One more magical place to visit!"
- A "Continue →" button that the parent can click (intentionally requires a parent to proceed — prevents unsupervised rushing)
- Background transitions to the color/theme of the upcoming module

---

## THE SCORING ENGINE (Post-Game)

After all 5 modules complete, run the synthesis engine. This must all execute in JavaScript in under 200ms.

### Step 1: Compute Pillar Scores

Normalize each theta to a 0–100 scale:
```javascript
function thetaToScore(theta) {
  // theta range: -3 to 3, map to 0-100
  return Math.round(((theta + 3) / 6) * 100);
}
```

Apply condition weights if flagged in setup.

### Step 2: Compute Composite Cognitive Index (CCI)

Weighted average of pillar scores:
```javascript
CCI = (
  theta_WM * 0.25 +    // Working Memory
  theta_PS * 0.20 +    // Processing Speed
  theta_EF * 0.25 +    // Executive Function (inhibitory control)
  theta_VS * 0.20 +    // Visuospatial
  theta_SC * 0.10      // Social Cognition
) // normalized to 0-100
```

If autism diagnosis flagged by parent: redistribute SC weight (0.10) proportionally across other four pillars.

### Step 3: Compute Consistency Index

```javascript
consistencyIndex = 1 - (mean([ITV_WM, ITV_PS, ITV_EF, ITV_VS, ITV_SC]) / 0.8)
// clamp 0-1. Higher = more consistent = more reliable session data
```

If `consistencyIndex < 0.4`, flag session as `lowReliability = true` and add caveat to output.

If `engagementFatigued = true` for 2+ modules, flag `highFatigue = true`.

### Step 4: Compute Drift-Diffusion Summary

Average `v` (drift rates) across modules → `meanDriftRate`
Average `a_bound` across modules → `meanBoundary`

Profile interpretation:
- High drift, high boundary: careful, deliberate thinker
- High drift, low boundary: fast, accurate, impulsive tendencies
- Low drift, high boundary: slow but cautious (processing concerns with compensation)
- Low drift, low boundary: fast-inaccurate pattern (impulsivity + processing concerns)

### Step 5: Profile Classification

Based on CCI and pillar pattern, assign one of six profiles (not diagnostic labels — observational descriptions):

```javascript
function classifyProfile(CCI, pillars, consistency) {
  if (CCI >= 70 && consistency >= 0.6) return "ENGAGED_LEARNER"
  if (CCI >= 55 && pillars.EF < 40 && pillars.PS < 45) return "ACTIVE_THINKER"
  if (CCI >= 55 && pillars.SC < 40) return "FOCUSED_EXPLORER"
  if (CCI >= 40 && CCI < 55 && consistency >= 0.5) return "DEVELOPING_AT_PACE"
  if (CCI < 40 && consistency >= 0.5) return "WARRANTS_ATTENTION"
  if (consistency < 0.4) return "INCONCLUSIVE"
}
```

Profile labels shown to parents (map internally — never expose the code names):
- ENGAGED_LEARNER → "Noor's Bright Star"
- ACTIVE_THINKER → "Noor's Energetic Explorer"
- FOCUSED_EXPLORER → "Noor's Quiet Thinker"
- DEVELOPING_AT_PACE → "Noor's Growing Adventurer"
- WARRANTS_ATTENTION → "Noor's Thoughtful Traveler" (with special follow-up language)
- INCONCLUSIVE → "Today Wasn't Our Day" (with re-try language)

---

## SCREEN 4: RESULTS + EDUCATIONAL RESOURCES

### Results Section

**Header:**
- Noor illustration with the child's profile badge
- Profile title (from mapping above)
- Date of activity (compute from Date object)

**Pentagraph / Radar Chart:**
Draw a pentagon radar chart using pure SVG/Canvas showing all 5 pillar scores. This must be a real rendered chart, not a placeholder. Use inline SVG with JavaScript-computed polygon points. Each pillar labeled around the pentagon. Fill color: sage green at 0.4 opacity. Stroke: primary green. Age-band average shown as a lighter reference polygon.

**Pillar Cards (5 cards, one per pillar):**
Each card contains:
- Pillar name (friendly version: "Remembering Things," "Thinking Speed," "Staying Focused," "Solving Puzzles," "Understanding Feelings")
- Score bar (CSS animated, fills on scroll into view)
- 2-sentence plain-language description of what the score means FOR THIS CHILD (generated by template string logic based on score band)
- Small Noor illustration relevant to that module

**Score band language templates (implement as JavaScript template functions):**

For each pillar, four bands: Strong (70-100), Typical (45-69), Emerging (25-44), Needs Support (<25)

Example for Working Memory:
```
Strong: "Your child showed excellent ability to hold and use information in mind during tasks — a great foundation for learning and following multi-step instructions."
Typical: "Your child's ability to hold information in mind is developing as expected for their age. This is a normal part of early learning."
Emerging: "Your child found it a little challenging to hold sequences in mind during the activity. This is something worth noting, though many children develop this skill at different rates."
Needs Support: "Your child struggled significantly with holding and using information in mind. This is an area where additional support from a professional could be very helpful."
```

Write equivalent templates for all 5 pillars × 4 bands = 20 templates.

**Consistency Notice:**
If `lowReliability = true`: display a warm amber notice: *"We noticed your child's engagement varied quite a bit during the activity, which can affect how accurately we can describe their thinking. The profile below reflects what we observed, but we'd recommend trying again on a different day for a clearer picture."*

If `highFatigue = true`: *"Children this age sometimes get tired mid-activity, and that's completely normal! Some of Noor's adventure may have been affected by your child being tired. Consider this profile a starting point."*

**The Follow-Up Section (most important):**

Based on profile classification:

For WARRANTS_ATTENTION (only):
> *"Based on what we observed today, your child's profile suggests it may be worth having a conversation with your pediatrician about a developmental evaluation. This is not a diagnosis — it's a data point. Here is what we'd recommend saying:*
>
> **'I had my child complete an online developmental activity called Khael. The results suggested some challenges in [list specific weak pillars]. I'd like to discuss whether a formal developmental evaluation is appropriate.'**
>
> A pediatrician can refer you to a developmental-behavioral pediatrician or neuropsychologist who can conduct a thorough assessment. Early evaluation is always better than waiting — even if the results turn out to be within normal range, the information is valuable."*

[Print/Save button that formats the results as a printable summary — use CSS @media print]

For DEVELOPING_AT_PACE:
> *"Your child's profile shows some areas that are developing a little differently from what we might expect. This is not cause for alarm — children develop at different rates — but it may be worth mentioning to your pediatrician at your next well-child visit. Use the summary below as a conversation starter."*

For all other profiles: affirming language + encouragement + "if you have any concerns, your pediatrician is always the right first call."

**Pediatrician Summary Card (printable):**
A styled card that prints cleanly with:
- "Khael Developmental Activity — Summary for Healthcare Provider"
- Date, age band, all pillar scores
- Flagged areas
- Clear disclaimer: "This is not a clinical assessment. It is a structured observational activity completed at home."
- Khael branding

---

### Educational Resources Section (inline on landing page AND linked from results)

This section lives at `#learn` and is comprehensive. Organize into 4 topic areas, each expandable (accordion style):

**Topic 1: Understanding Developmental Milestones**
Content covers:
- What developmental milestones are and why they exist
- Key milestones by age band (24m, 36m, 48m, 60m, 72m) across domains: language, motor, cognitive, social
- "Red flags" presented non-alarmingly: "signs that suggest talking to a professional sooner rather than later"
- Explanation of normal variability — why range matters more than exact age

**Topic 2: What Is Intellectual Disability?**
Content covers:
- Plain-language definition: affects both intellectual functioning and adaptive behavior
- Prevalence (1-3% of children), demographic spread, etiological diversity
- Difference between ID and learning disability, ID and autism (frequently confused by parents)
- Severity spectrum (mild, moderate, severe, profound) — described functionally, not numerically
- What life looks like for children with ID: affirming, accurate, avoiding tragedy framing
- Early intervention: what it is, why timing matters, how to access it

**Topic 3: The Evaluation Process — What to Expect**
Content covers:
- Why evaluations take so long and why that wait time is a systemic problem (validate the parent's frustration)
- What a full developmental evaluation involves: who is in the room, what tests are given, how long it takes
- The difference between screening and diagnosis
- How to get a referral: talking to a pediatrician, what to say, what to push for
- What to bring to an evaluation: behavioral observations, developmental history, school reports
- Questions to ask the evaluating team
- What happens after a diagnosis: IEP, early intervention services, therapy types

**Topic 4: Supporting Your Child at Home**
Content covers:
- Evidence-based strategies for working memory (spaced practice, visual supports)
- Evidence-based strategies for attention and inhibitory control (routine, transition warnings, movement breaks)
- Evidence-based strategies for processing speed (wait time, reducing information load)
- How to talk to siblings, family, and schools about developmental differences
- Self-care for parents of children with developmental concerns — brief but present
- Online communities and organizations (list: AAIDD, The Arc, Zero to Three, CDC Learn the Signs Act Early)

**Each topic accordion:**
- Closed state shows: icon + title + one-sentence teaser
- Open state: full content, warmly written, scannable with subheadings
- Smooth CSS expand/collapse animation

---

## TECHNICAL REQUIREMENTS

### Performance:
- Page must load and be interactive in under 3 seconds on a 4G connection
- All SVGs inline (no external image requests)
- Google Fonts loaded with `display=swap`
- No JavaScript frameworks (vanilla only)
- No build tools — pure browser-executable code

### Accessibility:
- All interactive elements have `aria-label`
- Color contrast ratio ≥ 4.5:1 for all text
- Focus indicators visible
- Font sizes: minimum 16px body, 14px captions
- Touch targets: minimum 44×44px for game interactions

### Responsive Design:
- Must work on: desktop (1200px+), tablet (768px), mobile (375px)
- Game canvas scales to viewport
- No horizontal scroll at any breakpoint

### Game Reliability:
- All 5 modules must complete without error
- IRT engine must handle edge cases: all-correct runs, all-incorrect runs, single-trial completion
- Theta clamped at [-3, 3] always
- RT recording must use `performance.now()` not `Date.now()` for sub-millisecond precision
- Trial log must be complete and inspectable in browser console for debugging

### Code Quality:
- Logical section comments throughout
- No dead code
- State management centralized in one object
- All scoring functions pure (input → output, no side effects)

---

## WHAT SUCCESS LOOKS LIKE

When complete, a parent should be able to:
1. Run `npm install && npm run dev` and open localhost:5173
2. Read the landing page and understand exactly what they're about to do
3. Complete the setup in under 60 seconds
4. Hand the device to their child
5. Watch their child play through all 5 modules (12-18 minutes)
6. Receive a results page with a radar chart, 5 pillar score cards, appropriate follow-up language, and a printable summary
7. Scroll down to comprehensive educational resources organized by topic
8. Print a pediatrician summary if warranted

The game must feel delightful, warm, and unhurried. The results must feel honest, caring, and actionable. The educational resources must feel authoritative but not clinical.

This is a product that a parent in a waiting room — anxious, uncertain, hoping for guidance — would find genuinely helpful and trustworthy.

Build it completely. Build it beautifully. Build it so it works.

---

## REVISED TECHNICAL REQUIREMENTS (replaces the above — Cursor/React project)

### Project Setup:
- Scaffold with `npm create vite@latest khael -- --template react`
- Dependencies: react, react-dom only. No UI libraries, no state management libraries, no animation libraries.
- Global state via React Context (GameStateContext) defined in `src/state/gameState.js`, provided from App.jsx.
- CSS Modules for all component styles. Global variables and resets in `src/App.css`.
- All SVGs are inline JSX React components — no `.svg` file imports, no raster images anywhere in the project.

### Architecture Rules:
- Engine files (`src/engine/`) are pure JavaScript ES modules — zero React imports, zero side effects, fully testable in isolation.
- Each game module component receives `({ ageBand, onComplete })` props. `onComplete(results)` is called when the module finishes, passing the full result object back to Game.jsx.
- Game.jsx is the sole orchestrator of module sequence and transition rendering. It reads `state.currentModule` and renders the correct module component.
- Results and scoring are computed entirely in `src/engine/scoring.js` from the completed `state.moduleResults` array — no scoring logic inside React components.
- Lazy load each game module: `const BerryBasket = React.lazy(() => import('./modules/BerryBasket'))` etc.

### Performance:
- Google Fonts in index.html with `display=swap`
- `React.memo` on all SVG components and pure display components
- `useCallback` on all event handlers passed as props in game modules
- `useMemo` on all derived values in Results.jsx (radar chart points, score bands, follow-up text)

### Accessibility:
- All interactive game elements: `role="button"`, `aria-label`, `tabIndex={0}`, keyboard activation via `onKeyDown` Enter/Space
- Color contrast ≥ 4.5:1
- Touch targets ≥ 44×44px
- Focus ring visible (don't suppress outline globally)

### Responsive:
- Game area: fixed 4:3 aspect ratio container using `aspect-ratio: 4/3` + `max-width: 800px` + `width: 100%`
- All breakpoints via CSS custom properties and `clamp()` for fluid type and spacing
- Test at 375px, 768px, 1280px

### Reliability:
- `performance.now()` for all RT measurement — assigned at stimulus render, delta taken on response
- Theta clamped in `irt.js` update function, never relies on callers
- `window.__khaelDebug = state` assigned in development for inspection
- Each module handles its own timer cleanup in `useEffect` return function — no memory leaks

### Code Quality:
- JSDoc on all engine functions
- Named constants at top of engine files (no magic numbers)
- No TODOs, no stubs, no placeholder components
- Every file in the project tree above must exist and be complete

