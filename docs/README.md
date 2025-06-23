# 📚 Project Documentation Index

Welcome to the documentation hub! This project is organized into modular folders to keep logic, responsibilities, and dependencies cleanly separated.

Each section below contains its own `README.md` with a list of files and their descriptions.

---

## 🗂️ Folder Structure

| Folder                            | Description                                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`global/`](./global/README.md)   | 🌐 Contains global constants, events, and style utilities. These modules are shared across the entire application.                                            |
| [`main/`](./main/README.md)       | 🧠 Core logic that runs in the main Electron process. Responsible for window management, system tray, IPC, app lifecycle, and more.                           |
| [`preload/`](./preload/README.md) | 🧬 Provides safe bridge logic between the renderer and main processes using Electron’s `contextBridge` API. Handles all IPC exposure and interface stability. |

---

## 📁 Access Each Section

Use the links below to jump to the specific module area:

* [`docs/global/README.md`](./global/README.md) – Shared helpers, CSS tools, and app-wide events.
* [`docs/main/README.md`](./main/README.md) – Window creation, app control, notifications, and app boot logic.
* [`docs/preload/README.md`](./preload/README.md) – IPC and security bridge between renderer ↔ main.

---

## 🧭 Goal

This documentation is built to provide a modular and intuitive overview of each area in the Electron app architecture, making it easy to find, explore, and maintain each feature or subsystem.
