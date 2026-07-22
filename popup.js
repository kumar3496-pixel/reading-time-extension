/**
 * popup.js
 * Orchestrates: ask the active tab's content script for page text ->
 * compute reading time -> run local summarizer -> render results.
 */

const loadingEl = document.getElementById("loading");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const readingTimeEl = document.getElementById("readingTime");
const wordCountEl = document.getElementById("wordCount");
const summaryTextEl = document.getElementById("summaryText");
const sentenceCountSelect = document.getElementById("sentenceCount");

let pageText = "";

function showState(state) {
  loadingEl.classList.toggle("hidden", state !== "loading");
  resultEl.classList.toggle("hidden", state !== "result");
  errorEl.classList.toggle("hidden", state !== "error");
}

function render(text, maxSentences) {
  const { words, minutes } = window.ReadingSummarizer.estimateReadingTime(text);
  const summary = window.ReadingSummarizer.summarize(text, maxSentences);

  readingTimeEl.textContent = minutes;
  wordCountEl.textContent = words.toLocaleString();
  summaryTextEl.textContent = summary || "Not enough text on this page to summarize.";
  showState("result");
}

async function init() {
  showState("loading");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) throw new Error("No active tab");

    chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_TEXT" }, (response) => {
      if (chrome.runtime.lastError || !response || !response.text || response.text.trim().length < 100) {
        showState("error");
        return;
      }
      pageText = response.text;
      const maxSentences = parseInt(sentenceCountSelect.value, 10);
      render(pageText, maxSentences);
    });
  } catch (err) {
    console.error(err);
    showState("error");
  }
}

sentenceCountSelect.addEventListener("change", () => {
  if (pageText) {
    render(pageText, parseInt(sentenceCountSelect.value, 10));
  }
});

document.addEventListener("DOMContentLoaded", init);
