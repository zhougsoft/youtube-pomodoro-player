# Pomodoro YouTube Player — Project Knowledge Base

**Last updated:** August 1 2025

---

## 1 · Vision / North‑Star User Story

I open a local web app, paste a YouTube URL (usually a long music‑mix), press one **Play** button, hear a quick “3‑2‑1” voice countdown, and then a 20‑minute Pomodoro begins while the video plays. Audio cues at 5 minutes remaining and 1 minute remaining keep me on track; when time is up, a final chime sounds and the video pauses, ready to resume from the same spot for the next session.

---

## 2 · Design Principles

* **Minimalism** — only what’s necessary.
* **Lindy‑tested, battle‑proven solutions**.
* **Unix philosophy** — do one thing well.
* **Fewest moving parts**.
* **80/20 Pareto simplicity**.

---

## 3 · Current Codebase Snapshot

### 3.1 Directory tree (at repo root)

```
public/
  1_min_remaining.mp3
  5_mins_remaining.mp3
  starting_countdown.mp3
  time_is_up.mp3
  vite.svg
src/
  assets/
    react.svg
  App.css
  App.tsx
  index.css
  main.tsx
  vite-env.d.ts
.gitignore
eslint.config.js
index.html
package.json
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

### 3.2 Key package versions

| Package           | Version |
| ----------------- | ------- |
| react / react‑dom | 19.1.0  |
| vite              | 7.0.4   |
| typescript        | 5.8.3   |
| eslint (strict)   | 9.30.1  |

---

## 4 · Assets (public/)

| File                     | Purpose                              |
| ------------------------ | ------------------------------------ |
| `starting_countdown.mp3` | Voice: “Three… Two… One…” (kick‑off) |
| `5_mins_remaining.mp3`   | Voice: “Five minutes remaining”      |
| `1_min_remaining.mp3`    | Voice: “One minute remaining”        |
| `time_is_up.mp3`         | Voice/chime: “Time is up”            |
| `vite.svg`               | Default Vite logo (placeholder)      |

All MP3s are preloaded via the browser’s cache when the app starts to eliminate latency.

---

## 5 · Functional Requirements

### 5.1 Session Lifecycle

| Phase                    | Action                                          | Audio                    | Timer             | Video                      |
| ------------------------ | ----------------------------------------------- | ------------------------ | ----------------- | -------------------------- |
| **Start click**          | Play countdown clip **and** issue `playVideo()` | `starting_countdown.mp3` | *Not running yet* | Playing                    |
| **After countdown ends** | Begin 20‑minute countdown                       | —                        | 20:00 → 00:00     | Continues                  |
| **15 min elapsed**       | Warning cue                                     | `5_mins_remaining.mp3`   | Running           | Playing                    |
| **19 min elapsed**       | Final warning                                   | `1_min_remaining.mp3`    | Running           | Playing                    |
| **20 min elapsed**       | End cue + pause video                           | `time_is_up.mp3`         | Stop / reset      | Paused (position retained) |
| **Ready**                | UI idle; next Play resumes video & timer        | —                        | Idle              | Paused                     |

### 5.2 State Machine

```
idle → countdownPlaying → pomodoroRunning → finished → idle
```

---

## 6 · Component Plan

| Component           | Responsibility                                                                    |
| ------------------- | --------------------------------------------------------------------------------- |
| `YouTubeEmbed.tsx`  | URL input, parse ID, render `<iframe>`, expose play/pause via ref (`postMessage`) |
| `PomodoroTimer.tsx` | Manage countdown, `setInterval` tick, fire audio cues, expose reset               |
| `App.tsx`           | Orchestrates state machine and UI; houses the **Play** button                     |

Minimal dependencies: plain React hooks; no extra libraries for YouTube or audio beyond native browser APIs.

---

## 7 · Implementation Notes

* **YouTube iframe API**: use `https://www.youtube.com/embed/{id}?enablejsapi=1&autoplay=1` and control with `player.playVideo()` / `player.pauseVideo()` via `postMessage`.
* **Audio planning**: dedicate one hidden `<audio>` element per MP3; call `.play()`; rely on the `ended` event of `starting_countdown.mp3` to trigger `startTimer()`.
* **Timer logic**: store `startTime = Date.now()`; `setInterval` every 1 s updates display; schedule:

  * `setTimeout` @ 15 min for 5‑min cue.
  * `setTimeout` @ 19 min for 1‑min cue.
  * `setTimeout` @ 20 min for final cue + pause + reset.
* **Reset**: clear all intervals/timeouts; revert UI to idle; keep iframe paused (position preserved).
* **Styling**: extremely light — center‑aligned column, big button, system font, white background. Strip Vite demo logos/CSS.

---

## 8 · Outstanding Tasks

1. Scaffold `YouTubeEmbed` and `PomodoroTimer` components.
2. Replace demo content in `App.tsx` with orchestrator logic.
3. Add minimalist CSS and remove starter styles.
4. Smoke‑test across Chromium / Firefox.

---

> **This document aggregates every decision, asset, and requirement captured up to this point. Future updates should modify this single source of truth.**