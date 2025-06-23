# 🎯 Events Reference

This document contains a centralized list of all internal event constants used across the application for **IPC communication**, **window management**, **notifications**, and **app lifecycle events**.  

These events are grouped into three main categories:

- 🚀 **AppEvents** — IPC events between Main ↔️ Renderer processes.
- 🔥 **RootEvents** — Internal app-level event emitter events.
- 🔔 **NotificationEvents** — Events related to desktop notifications.

---

## 🚀 AppEvents (IPC Channels)

These events are used to communicate between the **Main Process** and the **Renderer Process** via IPC. They represent window actions, system commands, and status checks.

| Event | Description |
| ----- | ----------- |
| `open-devtools` | 🛠️ Open the developer tools. |
| `set-title` | 🏷️ Set the window title. |
| `tiny-focus-window` | 🔍 Focus the window. |
| `tiny-blur-window` | 🌫️ Blur (unfocus) the window. |
| `tiny-show-window` | 👁️ Show the window. |
| `tiny-force-focus-window` | 💪 Force window to focus. |
| `system-idle-time` | ⏱️ Get system idle time in milliseconds. |
| `system-idle-state` | 💤 Get system idle state (`active`, `idle`, `locked`, etc.). |
| `toggle-visible` | 🔀 Toggle window visibility. |
| `app-quit` | ❌ Quit the app gracefully. |
| `set-proxy` | 🌐 Set a network proxy. |
| `set-proxy-error` | ❌ Proxy setting failed. |
| `window-is-maximized` | ❓ Is window maximized? |
| `window-maximize` | 🗖 Maximize window. |
| `window-unmaximize` | 🗗 Unmaximize window. |
| `window-minimize` | 🗕 Minimize window. |
| `window-is-focused` | ❓ Is window focused? |
| `window-is-visible` | ❓ Is window visible? |
| `window-is-fullscreen` | ❓ Is window fullscreen? |
| `window-ready-to-show` | ✅ Window is ready to show. |
| `window-hide` | 🙈 Hide window. |
| `window-show` | 👁️ Show window. |
| `window-close` | ❌ Close window. |
| `window-destroy` | 💣 Destroy window instance. |
| `change-app-icon` | 🖼️ Change window icon. |
| `change-tray-icon` | 🖼️ Change tray icon. |
| `console-message` | 🖨️ Send console message to renderer. |
| `electron-cache-values` | 📦 Get Electron cache (versions, user agent, etc.). |
| `ping` | 📶 Ping check (heartbeat). |
| `DOMContentLoaded` | 🌐 DOM loaded in renderer. |
| `resize` | 📐 Resize window. |
| `window-move` | 🧭 Move window to position. |
| `tiny-app-is-show` | 🚀 App is shown from tray/background. |
| `window-is-maximizable` | ❓ Is window maximizable? |
| `window-is-closable` | ❓ Is window closable? |
| `window-is-focusable` | ❓ Is window focusable? |
| `window-is-fullScreenable` | ❓ Is window fullscreenable? |
| `set-window-is-maximizable` | ⚙️ Set window maximizable state. |
| `set-window-is-closable` | ⚙️ Set window closable state. |
| `set-window-is-focusable` | ⚙️ Set window focusable state. |
| `set-window-is-fullscreenable` | ⚙️ Set window fullscreenable state. |
| `resized` | ✅ Window has been resized. |
| `will-resize` | ⏳ Window is about to resize. |

---

## 🔥 RootEvents (Internal Events)

These events are emitted internally using Node.js EventEmitters, mainly for handling **app state changes**, **window status**, and **proxy management**.

| Event | Description |
| ----- | ----------- |
| `IsMaximized` | 🗖 Window maximized or restored. |
| `IsFocused` | 🔍 Window focused or blurred. |
| `IsVisible` | 👁️ Window visibility changed. |
| `IsFullScreen` | 🖥️ Window entered/exited fullscreen. |
| `IsFullScreenable` | ✅ Window fullscreenable state changed. |
| `IsMaximizable` | ✅ Window maximizable state changed. |
| `IsClosable` | ✅ Window closable state changed. |
| `IsFocusable` | ✅ Window focusable state changed. |
| `SetProxyError` | ❌ Proxy setup failed. |
| `SetProxy` | 🌐 Proxy set successfully. |
| `Resize` | 📐 Window is resizing. |
| `Resized` | ✅ Window resize completed. |
| `WillResize` | ⏳ Window about to resize. |
| `Ping` | 📶 Internal heartbeat ping. |
| `Ready` | 🚀 App is fully initialized. |
| `CreateFirstWindow` | 🏗️ First window is being created. |
| `ReadyToShow` | ✅ Window is ready to show. |
| `DOMContentLoaded` | 🌐 Renderer DOM fully loaded. |
| `ShowApp` | 🚀 App is shown from background/tray. |
| `WindowMove` | 🧭 Window moved to new position. |

---

## 🔔 NotificationEvents (Notification Lifecycle)

These events track the lifecycle of **desktop notifications**, allowing hooks for when they are created, shown, clicked, or closed.

| Event | Description |
| ----- | ----------- |
| `tiny-notification-create` | 🆕 Notification created. |
| `tiny-notification-show` | 👀 Notification shown. |
| `tiny-notification-all` | 🔔 Catch-all for notification events. |
| `tiny-notification-click` | 👆 Notification clicked. |
| `tiny-notification-reply` | 💬 Notification replied (if supported). |
| `tiny-notification-action` | 🎯 Action button clicked. |
| `tiny-notification-failed` | ❌ Notification failed. |
| `tiny-notification-close` | 🛑 Notification closed. |

---

## 🧠 Why Use Centralized Events?

✅ Avoid magic strings everywhere in the code.  
✅ Prevent typos and mismatches between main ↔️ renderer IPC communication.  
✅ Clean, readable, and easy to maintain.  
✅ Auto-completion and type safety when using with TypeScript or JSDoc.
