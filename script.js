// ---------- Configuration ----------
const API_BASE = "https://api.dictionaryapi.dev/api/v0/entries/en/";
const STORAGE_KEYS = {
  saved: "wordly:savedWords",
  theme: "wordly:theme",
};
// Letters only, with optional apostrophes, hyphens, or spaces between words
const WORD_PATTERN = /^[A-Za-z]+(?:['\- ][A-Za-z]+)*$/;
const MAX_SYNONYMS = 6;
const MAX_DEFINITIONS = 3;

// ---------- DOM references ----------
const form = document.getElementById("search-form");
const input = document.getElementById("word-input");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const resultWord = document.getElementById("result-word");
const resultPhonetic = document.getElementById("result-phonetic");
const resultAudio = document.getElementById("result-audio");
const resultMeanings = document.getElementById("result-meanings");
const resultSources = document.getElementById("result-sources");
const saveBtn = document.getElementById("save-btn");
const savedList = document.getElementById("saved-list");
const savedEmpty = document.getElementById("saved-empty");
const themeToggle = document.getElementById("theme-toggle");

let currentEntry = null;

// ---------- Helpers ----------
function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// ---------- Saved words (localStorage) ----------
function getSavedWords() {
  try {
    const words = JSON.parse(localStorage.getItem(STORAGE_KEYS.saved));
    return Array.isArray(words) ? words : [];
  } catch {
    return [];
  }
}

function setSavedWords(words) {
  try {
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(words));
  } catch {
    setStatus("Could not save your word. Storage may be full or disabled.", true);
  }
}

function isSaved(word) {
  return getSavedWords().includes(word.toLowerCase());
}

function toggleSaved(word) {
  const key = word.toLowerCase();
  const words = getSavedWords();
  const index = words.indexOf(key);

  if (index >= 0) {
    words.splice(index, 1);
  } else {
    words.push(key);
  }

  setSavedWords(words);
  renderSavedList();
  updateSaveState();
}

function updateSaveState() {
  if (!currentEntry) {
    saveBtn.hidden = true;
    resultEl.classList.remove("saved");
    return;
  }

  const saved = isSaved(currentEntry.word);
  saveBtn.hidden = false;
  saveBtn.textContent = saved ? "Saved ✓" : "Save word";
  saveBtn.setAttribute("aria-pressed", String(saved));
  saveBtn.setAttribute(
    "aria-label",
    saved ? `Remove ${currentEntry.word} from saved words` : `Save ${currentEntry.word} to saved words`
  );
  resultEl.classList.toggle("saved", saved);
}

function renderSavedList() {
  const words = getSavedWords();
  clearChildren(savedList);
  savedEmpty.classList.toggle("hidden", words.length > 0);

  words.forEach((word) => {
    const item = el("li", "saved-item");

    if (currentEntry && currentEntry.word.toLowerCase() === word) {
      item.classList.add("current");
    }

    const wordBtn = el("button", "saved-word", word);
    wordBtn.type = "button";
    wordBtn.setAttribute("aria-label", `Look up ${word}`);
    wordBtn.addEventListener("click", () => {
      input.value = word;
      lookup(word);
    });

    const removeBtn = el("button", "remove-btn", "Remove");
    removeBtn.type = "button";
    removeBtn.setAttribute("aria-label", `Remove ${word} from saved words`);
    removeBtn.addEventListener("click", () => toggleSaved(word));

    item.append(wordBtn, removeBtn);
    savedList.append(item);
  });
}

// ---------- API ----------
async function fetchDefinition(word) {
  const query = encodeURIComponent(word.trim().toLowerCase());

  let response;
  try {
    response = await fetch(API_BASE + query);
  } catch {
    throw new Error("Could not reach the dictionary service. Check your connection and try again.");
  }

  if (response.status === 404) {
    throw new Error(`No definitions found for "${word}". Check the spelling and try again.`);
  }

  if (!response.ok) {
    throw new Error(`The dictionary request failed (status ${response.status}). Please try again later.`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The dictionary returned an unexpected response. Please try again.");
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No definitions found for "${word}".`);
  }

  return data[0];
}

// ---------- Data extraction ----------
function getPronunciation(entry) {
  if (entry.phonetic) return entry.phonetic;
  const withText = (entry.phonetics || []).find((p) => p.text);
  return withText ? withText.text : "";
}

function getAudioUrl(entry) {
  const withAudio = (entry.phonetics || []).find((p) => p.audio);
  return withAudio ? withAudio.audio : "";
}

function getSynonyms(meaning) {
  const fromMeaning = meaning.synonyms || [];
  const fromDefinitions = (meaning.definitions || []).flatMap((d) => d.synonyms || []);
  return [...new Set([...fromMeaning, ...fromDefinitions])].slice(0, MAX_SYNONYMS);
}

// ---------- Rendering ----------
function renderHeader(entry) {
  resultWord.textContent = entry.word;

  const pronunciation = getPronunciation(entry);
  resultPhonetic.textContent = pronunciation
    ? `Pronunciation: ${pronunciation}`
    : "Pronunciation not available for this word.";

  clearChildren(resultAudio);
  const audioUrl = getAudioUrl(entry);
  if (audioUrl) {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    audio.src = audioUrl;
    audio.setAttribute("aria-label", `Audio pronunciation of ${entry.word}`);
    resultAudio.append(audio);
  } else {
    resultAudio.append(el("p", "fallback", "No audio available for this word."));
  }
}

function renderMeanings(entry) {
  clearChildren(resultMeanings);
  const meanings = entry.meanings || [];

  if (meanings.length === 0) {
    resultMeanings.append(el("p", "fallback", "No definitions are available for this word."));
    return;
  }

  meanings.forEach((meaning) => {
    const section = el("div", "meaning");
    section.append(el("h3", "part-of-speech", meaning.partOfSpeech || "Unknown part of speech"));

    const list = el("ol", "definitions");
    const definitions = (meaning.definitions || []).slice(0, MAX_DEFINITIONS);

    if (definitions.length === 0) {
      list.append(el("li", "fallback", "No definition available for this part of speech."));
    }

    definitions.forEach((def) => {
      const li = el("li");
      li.append(el("p", "", def.definition || "No definition text provided."));
      if (def.example) {
        li.append(el("p", "example", `"${def.example}"`));
      }
      list.append(li);
    });
    section.append(list);

    const synonyms = getSynonyms(meaning);
    section.append(
      synonyms.length > 0
        ? el("p", "synonyms", `Synonyms: ${synonyms.join(", ")}`)
        : el("p", "synonyms fallback", "No synonyms available for this part of speech.")
    );

    resultMeanings.append(section);
  });
}

function renderSources(entry) {
  clearChildren(resultSources);

  const sourceUrls = entry.sourceUrls || [];
  if (sourceUrls.length > 0) {
    const link = el("a");
    link.href = sourceUrls[0];
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View source";
    resultSources.append(link);
  }

  if (entry.license && entry.license.name) {
    resultSources.append(el("p", "", `License: ${entry.license.name}`));
  }
}

function renderEntry(entry) {
  currentEntry = entry;
  resultEl.classList.remove("hidden");

  renderHeader(entry);
  renderMeanings(entry);
  renderSources(entry);
  updateSaveState();
  renderSavedList();
}

function hideResult() {
  currentEntry = null;
  resultEl.classList.add("hidden");
  updateSaveState();
  renderSavedList();
}

// ---------- Lookup flow ----------
async function lookup(rawWord) {
  const word = rawWord.trim();

  if (!word) {
    hideResult();
    setStatus("Please enter a word to search.", true);
    input.focus();
    return;
  }

  if (!WORD_PATTERN.test(word)) {
    hideResult();
    setStatus("Please enter a valid English word using letters only.", true);
    input.focus();
    return;
  }

  setStatus(`Looking up "${word}"...`);
  hideResult();

  try {
    const entry = await fetchDefinition(word);
    setStatus(`Showing results for "${entry.word}".`);
    renderEntry(entry);
    resultEl.focus();
  } catch (error) {
    setStatus(error.message, true);
  }
}

// ---------- Theme (updates CSS variables via data-theme) ----------
function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

themeToggle.addEventListener("click", () => {
  const next = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(STORAGE_KEYS.theme, next);
});

// ---------- Event listeners ----------
form.addEventListener("submit", (event) => {
  event.preventDefault();
  lookup(input.value);
});

saveBtn.addEventListener("click", () => {
  if (currentEntry) toggleSaved(currentEntry.word);
});

// ---------- Init ----------
applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || "light");
renderSavedList();
updateSaveState();