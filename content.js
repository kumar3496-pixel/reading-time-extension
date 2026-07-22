/**
 * content.js
 * Runs in the context of the web page. Extracts the main readable text
 * so the popup / background script can compute reading time and a summary.
 *
 * Extraction heuristic:
 *  1. Prefer <article> if present.
 *  2. Otherwise pick the element with the most cumulative <p> text.
 *  3. Fall back to document.body.
 */

function getMainText() {
  const article = document.querySelector("article");
  if (article && article.innerText.trim().length > 200) {
    return article.innerText;
  }

  // Heuristic: find the container with the most paragraph text.
  const candidates = Array.from(document.querySelectorAll("main, #content, .content, .post, .article-body"));
  let best = null;
  let bestLen = 0;
  for (const el of candidates) {
    const len = el.innerText ? el.innerText.length : 0;
    if (len > bestLen) {
      best = el;
      bestLen = len;
    }
  }
  if (best && bestLen > 200) return best.innerText;

  // Fallback: aggregate all <p> tags on the page.
  const paragraphs = Array.from(document.querySelectorAll("p"))
    .map((p) => p.innerText.trim())
    .filter((t) => t.length > 40);
  if (paragraphs.length > 0) return paragraphs.join("\n\n");

  return document.body.innerText || "";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_TEXT") {
    const text = getMainText();
    sendResponse({
      text,
      title: document.title,
      url: window.location.href,
    });
  }
  return true; // keep the message channel open for async response
});
