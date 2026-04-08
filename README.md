# Aces

Aces is an all-in-one desktop productivity dashboard built with Electron, React, and TypeScript. It brings together assignments, schedule planning, notes, cashflow tracking, weather, and a focus timer in one app with a custom desktop UI.

![Aces Overview](public/icon.png)

## Features

- Dashboard with weather, focus timer, assignment overview, schedule overview, and cashflow summary
- Kanban-style assignment board with create, edit, drag-and-drop status changes, and calendar-based due date picking
- Focus timer with presets, custom timer lengths, and alarm sound
- Weekly schedule grid with add/edit flows and 24-hour time input
- Cashflow tracker with monthly filtering, monthly balance, edit/delete transactions, and calendar date picker
- Notes workspace with autosaved notes and export tools
- Profile and settings pages for profile info, weather city, cashflow currency, and theme preferences
- Desktop title bar controls with a light/dark mode toggle
- Startup loading screen for a smoother app launch

## Tech Stack

- React 18
- TypeScript
- Electron
- Vite 5
- Tailwind CSS 4
- shadcn/ui
- Radix UI primitives
- `date-fns`
- Lucide React

## State Management

Aces uses local React stores and context-based state, plus a small external store for the focus timer. App data such as notes, assignments, schedule items, profile data, and cashflow transactions is persisted in `localStorage`.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/binnewbs/Aces.git
cd Aces
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

This builds the renderer, Electron process, and installer output via `electron-builder`.

## Project Structure

```text
electron/           Electron main and preload processes
public/             Static assets like icons and audio
src/
  components/       Reusable UI and feature components
  hooks/            Shared React hooks
  lib/              Stores, utilities, and seed data
  pages/            Top-level route pages
```

## Notes

- Weather data uses Open-Meteo and only requires a city name.
- The app uses a frameless Electron window with custom window controls.
- Theme preference can be changed from Settings or the title bar toggle.

## License

Private project for personal use.
