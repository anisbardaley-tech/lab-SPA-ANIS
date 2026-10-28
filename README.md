# lab-SPA-ANIS
# Wordly Dictionary

Wordly Dictionary is a Single Page Application (SPA) built with HTML, CSS, and JavaScript. Users search for an English word and see its pronunciation, audio (when available), part of speech, definitions, example usage, synonyms, and source details, all without reloading the page.

## Features

- **Search:** An HTML form takes a word and fetches its entry from the Free Dictionary API.
- **Definitions:** Shows the definition, part of speech, and example usage for each meaning.
- **Pronunciation and audio:** Shows the phonetic spelling and an audio player when one is available.
- **Synonyms:** Lists synonyms for each part of speech.
- **Fallback messages:** Words without pronunciation, audio, or synonyms show a clear message instead of blank space.
- **Input validation:** Empty or invalid input (such as numbers or symbols) is rejected before any request is sent.
- **Saved words:** Save favorite words. They persist across reloads using `localStorage`.
- **Dynamic styling:** Saved entries are highlighted, and the light and dark themes are switched by JavaScript updating CSS variables.
- **Accessibility:** Semantic HTML, labels, `aria-` attributes, live status messages, a skip link, and visible focus styles.
- **Error handling:** Clear messages for words not found, network failures, and unexpected API responses.

## Tech Stack

- HTML5 (semantic markup and ARIA)
- CSS3 (custom properties, transitions, hover effects)
- Vanilla JavaScript (`fetch`, `async`/`await`, DOM manipulation)
- [Free Dictionary API](https://dictionaryapi.dev/) (no API key required)
- [http-server](https://www.npmjs.com/package/http-server) for local development

## Project Structure


wordly-dictionary/
├── index.html      # Page structure, search form, results placeholders
├── styles.css      # Layout, styling, hover effects, and theme variables
├── script.js       # Validation, fetch requests, rendering, saved words, theme
├── package.json    # Project metadata and npm scripts
├── .gitignore      # Files Git should ignore
└── README.md       # Project documentation


## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or newer) and npm
- An internet connection (the app fetches definitions from the API)

### Installation

1. Open a terminal in the project folder:

   bash
   cd wordly-dictionary
   

2. Install the development server:

   bash
   npm install
   

3. Start the app:

   bash
   npm start
   

4. Open `http://localhost:8080` if the browser does not open automatically.

You can also open `index.html` directly in a browser, but a local server is recommended.

## How to Use

1. Type a word such as `serendipity` into the search box and press **Search**.
2. Review the pronunciation, audio, definitions, examples, and synonyms.
3. Click **Save word** to add the word to your saved list.
4. Click a saved word to look it up again, or click **Remove** to delete it.
5. Click **Dark mode** or **Light mode** to change the theme.

## Testing Checklist

- A valid word such as `serendipity` displays all of its data.
- A word with no audio or pronunciation shows the fallback messages.
- An empty search shows a prompt and sends no request.
- An invalid search such as `123` shows a validation message and sends no request.
- A nonsense word such as `asdfgh` shows the "not found" message.
- Saving, removing, and reloading the page keep saved words.

## API Reference


GET https://api.dictionaryapi.dev/api/v0/entries/en/{word}


A successful request returns an array of entries. A word that does not exist returns a `404` status, which the app shows as a "not found" message.

## Limitations

- Only English words are supported.
- The API is a free public service. Heavy use may lead to rate limiting or outages, which the app reports as an error message.
- Saved words are stored in the browser, so they do not sync across devices.

## Version Control and Maintenance

- **Version control:** The project is tracked with Git. Initialize it with `git init`, commit changes with clear messages, and use branches for new features. To restore an earlier version of a file, use `git log` to find the commit and then `git checkout <commit> -- <file>`.
- **Regular reviews:** Review the code regularly to confirm it still works with the Free Dictionary API and current JavaScript and browser standards.
- **Documentation:** Keep this README, code comments, and lab notes up to date in one central repository alongside the example code and solutions.

## Learning Objectives

This project demonstrates:

- Building a Single Page Application that updates without page reloads
- Making asynchronous HTTP requests with `fetch` and handling responses
- Creating HTML forms, validating input, and reading user input
- Dynamically creating and updating DOM elements
- Using JavaScript to change CSS (themes, highlighting, and fallback styling)
- Persisting data with `localStorage`
- Writing accessible markup with semantic HTML and ARIA attributes
- Handling errors gracefully for users

## License
Licensed by MIT
