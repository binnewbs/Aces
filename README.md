# 🂡 Aces - All-in-One Productivity Hub

Aces is a premium, high-fidelity desktop productivity dashboard built with **Electron** and **React**. Designed specifically for students and power users, it combines essential tools like an assignment manager, focus timer, and dynamic schedule into a single, cohesive, glassmorphism-inspired interface.

![Aces Overview](public/icon.png)

## ✨ Features

- **📊 Dynamic Dashboard**: A central hub featuring a live weather card, assignment overview, and focus timer.
- **📅 Assignment Manager**: Full Kanban-style board to track and manage your college assignments.
- **⏱️ Focus Timer**: A sleek, customizable Pomodoro-style timer to track deep work sessions.
- **🗓️ Weekly Schedule**: Visual grid for managing classes, meetings, and personal tasks.
- **📝 Notes & Tasks**: Integrated note-taking and profile management for personalized experiences.
- **🎨 Premium UI**: Built with **Shadcn/UI** and custom CSS for a modern, sleek, and responsive aesthetic.

## 🛠️ Tech Stack

- **Core**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Desktop Wrapper**: [Electron](https://www.electronjs.org/)
- **Build System**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (via custom stores)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/binnewbs/Aces.git
   cd Aces
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```

### Building for Production

To create a production-ready installer for your OS:
```bash
npm run build
```
This will compile the application and create an installer in the `release/` folder using `electron-builder`.

## 📂 Project Structure

```bash
├── electron/          # Electron main and preload processes
├── src/               # React frontend source code
│   ├── components/    # Reusable UI components (Shadcn + Custom)
│   ├── pages/         # Page-level components (Dashboard, Assignments, etc.)
│   ├── lib/           # Stores and utility functions
│   └── hooks/         # Custom React hooks
├── public/            # Static assets
└── vite.config.ts     # Vite configuration
```

## 📄 License

This project is private and intended for personal use.

---

*Made with ♥ for productivity.*
