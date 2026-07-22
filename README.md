# Reading Time + Summary (Chrome Extension, Manifest V3)

Estimates how long an article will take to read and generates a quick
extractive summary — all locally in the browser, no API key required.

## Features
- One-click popup shows **estimated reading time** and **word count**
- Local, dependency-free **extractive summarizer** (word-frequency based
  sentence scoring — a mini TextRank), adjustable summary length
- Smart content extraction: prefers `<article>`, falls back to common
  content containers, then to aggregated `<p>` tags
- No network calls, no API key, no tracking — everything runs on-device

## Installation (load unpacked)
1. Open `chrome://extensions` (or `edge://extensions` for Edge)
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `reading-time-extension` folder
5. Pin the extension and click it on any article page

## How it works
1. `content.js` runs on every page and extracts the main readable text
2. When you click the extension icon, `popup.js` asks the content script
   for that text via `chrome.tabs.sendMessage`
3. `summarizer.js` computes:
   - **Reading time** = word count ÷ 200 wpm
   - **Summary** = top-N highest-scoring sentences (by word frequency,
     normalized by length), re-ordered to preserve original flow
4. Results render in the popup UI

## Project structure
```
reading-time-extension/
├── manifest.json      # MV3 manifest
├── content.js          # extracts readable text from the page
├── background.js       # service worker (extension lifecycle)
├── summarizer.js        # local extractive summarization + reading time
├── popup.html            # popup UI markup
├── popup.css             # popup styling
├── popup.js               # popup logic / orchestration
├── icons/                  # extension icons (16/48/128px)
└── README.md
```

## Swapping in a real LLM summary (optional upgrade)
The local summarizer is fast and free but purely extractive (it selects
existing sentences rather than generating new text). To upgrade:

1. Add an options page to store an API key (`chrome.storage.local`)
2. In `background.js`, add a `fetch()` call to your LLM provider's API
   (Anthropic, OpenAI, or a local Ollama server) with the extracted page
   text as context
3. Have `popup.js` call the background script instead of
   `window.ReadingSummarizer.summarize()` when an API key is present, and
   fall back to the local summarizer otherwise

This keeps the extension fully functional out of the box while leaving
room to plug in a real model later.

## Ideas to extend
- Add a context-menu "Summarize selection" option
- Cache summaries per URL in `chrome.storage.local`
- Add a reading-time badge overlay directly on the page
- Support Firefox (manifest is mostly compatible; swap `chrome.*` for
  `browser.*` or use the `webextension-polyfill`)
