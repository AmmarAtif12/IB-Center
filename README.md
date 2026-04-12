# IB Central

A desktop application for IB (International Baccalaureate) students to track their academic progress.

## Features

- **Dashboard** – View your predicted DP score out of 45, with a visual ring indicator and per-subject breakdown
- **Grade Tracker** – Record and track scores (1–7) for each subject across assessments
- **Assignments Planner** – Manage assignments with due dates, completion tracking, and overdue alerts
- **Subjects Hub** – Organize subjects with notes and resources for each one

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: SQLite via `sql.js` (embedded, no server required)
- **Desktop**: Electron
- **Packaging**: electron-builder (`.dmg` for macOS, `.exe` for Windows, `.AppImage` for Linux)

## Design

Clean, modern dark blue colour scheme with smooth animations.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm

### Install Dependencies

```bash
npm install
```

### Run the Application

```bash
npm start
```

### Run Tests

```bash
npm test
```

### Build for Distribution

```bash
# macOS (.dmg)
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

## Project Structure

```
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── backend/
│   └── database.js      # SQLite database layer
├── frontend/
│   ├── index.html       # App UI
│   ├── styles.css       # Dark blue theme styles
│   └── renderer.js      # Frontend logic
├── test/
│   └── run-tests.js     # Database unit tests
└── package.json         # Project config & build settings
```