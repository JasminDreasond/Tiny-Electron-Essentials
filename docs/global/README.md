# 🌐 Global Folder

The **`global/`** folder contains shared utilities and constants that are used across the entire Electron application. These modules are designed to be framework-agnostic and independent of any specific window or process instance. They provide tools for consistent styling, event handling, and general-purpose operations.

This ensures that common functionality remains centralized, clean, and easy to maintain.

---

## 📄 Available Documents

| File                         | Description                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`CssFile`](./CssFile.md)    | 📜 Provides utilities for managing CSS files. Includes functions to save CSS to disk and generate default styles for custom window frames.                          |
| [`Events`](./Events.md)      | 🔗 Contains all internal event definitions used in the application. This includes IPC communication events, notification events, and internal app lifecycle events. |

---

## 🚀 Purpose

* ✅ **Centralized Constants:** All events used between processes and modules.
* ✅ **Reusable Styles:** Programmatically generate CSS for window frames.
* ✅ **Utilities:** Simple, reliable, and shareable helper functions.

---

## 🏗️ Usage Example

```javascript
import { AppEvents } from './global/Events.js';
import { saveCssFile } from './global/CssFile.js';

// Example of sending an IPC event
mainWindow.webContents.send(AppEvents.OpenDevTools);

// Example of saving CSS
await saveCssFile('./styles', 'custom-frame.css', cssContent);
```

---

## 📚 More Documentation

Check individual files for detailed information about their usage and capabilities.
