# One Good Thing

A small React app for choosing one gentle, doable idea for today. The app remembers completed ideas in this browser, so there is no account or setup beyond running it locally.

## Run it

1. Install [Node.js](https://nodejs.org/) if it is not already installed.
2. Open this folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run `npm install` once, then `npm run dev`.
5. Open the local address Vite prints in the terminal (usually `http://localhost:5173`).

## Project map

- `src/main.jsx` starts React and loads the styles.
- `src/App.jsx` contains the daily ideas, state, and page components.
- `src/styles.css` contains the layout, colors, and responsive styles.
- `index.html` is the HTML page Vite loads.

Ideas and completion history are stored in this browser's `localStorage` under `one-good-thing-data`.

## Install on a phone and reminders

Deploy the app to an HTTPS address, then open that address on your phone. On iPhone, use Safari's **Share → Add to Home Screen**. On Android, use the browser menu and choose **Install app**. The install button is also available in the app when the browser supports it.

Choose a time and allow notifications to set a daily nudge. This simple version schedules it while the app is open. Reminders that arrive after the app has been fully closed need a push notification service and a small server setup.

There are more than 40 built-in combinations for now. Truly open-ended ideas need an AI API connected through a server so the API key stays private.
