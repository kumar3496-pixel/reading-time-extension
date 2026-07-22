/**
 * summarizer.js
 * A lightweight, dependency-free extractive summarizer that runs entirely
 * in the browser — no API key or network call required.
 *
 * Algorithm (classic word-frequency scoring, similar to a mini TextRank):
 *   1. Split text into sentences.
 *   2. Build a word-frequency table (minus stopwords).
 *   3. Score each sentence by the sum of its words' frequencies,
 *      normalized by sentence length.
 *   4. Return the top N sentences, re-ordered to match their original
 *      position in the text (so the summary still reads coherently).
 *
 * This is intentionally swappable: replace `summarize()` internals with a
 * call to an LLM API (OpenAI/Anthropic/local Ollama) if you want higher
 * quality summaries — the popup.js call site doesn't need to change.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
  "been", "being", "in", "on", "at", "to", "for", "of", "with", "as", "by",
  "that", "this", "it", "its", "from", "than", "then", "so", "such", "not",
  "no", "do", "does", "did", "has", "have", "had", "will", "would", "can",
  "could", "should", "may", "might", "must", "shall", "into", "about",
  "over", "after", "before", "between", "through", "during", "up", "down",
  "out", "off", "again", "further", "once", "here", "there", "when",
  "where", "why", "how", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "only", "own", "same", "just", "also",
]);

function splitSentences(text) {
  // Simple sentence splitter: handles ., !, ? followed by whitespace.
  const cleaned = text.replace(/\s+/g, " ").trim();
  const matches = cleaned.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!matches) return [cleaned];
  return matches.map((s) => s.trim()).filter((s) => s.length > 20);
}

function wordFrequencies(sentences) {
  const freq = {};
  for (const sentence of sentences) {
    const words = sentence.toLowerCase().match(/[a-z']+/g) || [];
    for (const w of words) {
      if (STOPWORDS.has(w) || w.length < 3) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  return freq;
}

function scoreSentence(sentence, freq) {
  const words = sentence.toLowerCase().match(/[a-z']+/g) || [];
  if (words.length === 0) return 0;
  let score = 0;
  for (const w of words) {
    score += freq[w] || 0;
  }
  return score / Math.sqrt(words.length); // normalize, mildly favor concise sentences
}

/**
 * @param {string} text - full article text
 * @param {number} maxSentences - how many sentences to include in the summary
 * @returns {string} summary text
 */
function summarize(text, maxSentences = 3) {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences.join(" ");

  const freq = wordFrequencies(sentences);
  const scored = sentences.map((s, idx) => ({
    sentence: s,
    idx,
    score: scoreSentence(s, freq),
  }));

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx); // restore original order

  return top.map((s) => s.sentence).join(" ");
}

function estimateReadingTime(text, wpm = 200) {
  const words = (text.match(/\S+/g) || []).length;
  const minutes = words / wpm;
  return {
    words,
    minutes: Math.max(1, Math.round(minutes)),
  };
}

// Exposed for popup.js (classic script include, no module bundler needed)
window.ReadingSummarizer = { summarize, estimateReadingTime };
