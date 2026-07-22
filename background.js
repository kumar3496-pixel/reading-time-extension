/**
 * background.js
 * Minimal MV3 service worker. Currently just logs install events and
 * serves as an extension point if you later want to add a context-menu
 * item ("Summarize this page") or call an external LLM API from here.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Reading Time + Summary extension installed.");
});
