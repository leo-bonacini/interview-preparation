# Interview Preparation

A self-contained, static web tool for practicing (or running candidates through) C++ and Python questions aimed at robotics engineering interviews. No build step, no backend, no dependencies to install: it's plain HTML/CSS/JS that runs entirely in the browser.

## Live use

Open `interview_prep.html` in a browser (locally, or via GitHub Pages once published). You'll see a start screen with three fields:

- **Language**: C++ or Python
- **Candidate name**: used to seed which questions are picked
- **# of questions**: how many to pull for this session

Click **Generate question set** and a randomized set of questions appears, split into Theory, a worked Example, and an Exercise (fill in the `TODO`, then click **Compile & Check** to run your code for real and compare its output to the expected answer).

### Picking questions is deterministic per name

The same candidate name always produces the exact same question set (same questions, same order), because the selection is seeded from a hash of the name rather than pulled from `Math.random()`. Two different names will (almost always) get different sets. This means:

- You can regenerate the same set for a candidate later (e.g. to review their answers) just by re-entering their name.
- Different candidates interviewing on the same day get different, comparably-difficulty question sets rather than everyone seeing the same fixed list.

### Difficulty mix

Every question is tagged `basic`, `intermediate`, or `advanced` (shown as a badge on each card). Whatever size set you request, it's assembled with a fixed 30% / 30% / 40% split across those three tiers, so a 10-question set always has a sensible spread of difficulty rather than being purely random luck.

## How answers are checked

Clicking **Compile & Check** sends your code to [Wandbox](https://wandbox.org) (a free public compiler/interpreter service) over the network, runs it for real (GCC for C++, CPython for Python), and compares the actual stdout to the expected output byte-for-byte. It is a real run, not a text/pattern match against your source.

Because of this:

- **An internet connection is required** to check answers (the rest of the page works fully offline).
- **Your code is sent to a third-party service.** Don't paste anything sensitive or proprietary into the editor.
- Wandbox's Python sandbox has no third-party packages installed (no `numpy`, etc.) — the Python questions intentionally stick to the standard library for this reason.

## File structure

```
interview_prep.html   the app: gate screen, rendering, seeding logic, and the compile/check flow
questions_cpp.js      the C++ question bank (TOPIC_BANKS.cpp)
questions_python.js   the Python question bank (TOPIC_BANKS.python)
```

The two question-bank files just populate a global `TOPIC_BANKS` object; `interview_prep.html` loads both via `<script src>` and picks whichever bank matches the language dropdown. All three files need to be deployed together — the HTML file alone won't have any questions to show.

## Publishing on GitHub Pages

1. Push this folder to a GitHub repo.
2. In the repo's **Settings → Pages**, set the source to the branch/folder containing these three files (e.g. `main` / `/root`).
3. GitHub will publish it at `https://<username>.github.io/<repo>/interview_prep.html`.

No build step, no environment variables, nothing else to configure — it's static files.

## Adding new questions

Each question is one object in the `topics` array inside `questions_cpp.js` or `questions_python.js`:

```js
{
  id: "unique-slug",
  tag: "Category shown as a pill",
  level: "basic" | "intermediate" | "advanced",
  title: "Question title",
  theory: `<ul><li>...</li></ul>`,      // HTML shown under "Theory"
  example: `...code...`,                 // shown under "Example" as plain code (not run)
  task: `...HTML description...`,        // shown above the editor
  starter: `...code with a TODO...`,     // pre-filled into the editor
  expected: "exact stdout, trimmed",     // must match real compiler/interpreter output exactly
  hint: "the fix, as plain text",
  options: "warning,gnu++17"             // compiler flags (C++ only; leave "" for Python)
}
```

Before adding one, fill in the `TODO` yourself and run it through Wandbox's API directly (or paste it into the tool) to confirm the exact `expected` string — a mismatched expected value (wrong whitespace, wrong float rounding, etc.) will make a correct answer show as failing.
