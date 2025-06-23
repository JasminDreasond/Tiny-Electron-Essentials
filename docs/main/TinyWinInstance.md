# 📄 TinyWinInstance

A powerful class that manages a single Electron `BrowserWindow` instance with advanced control over window state, events, communication, and lifecycle. ✨

---

## 🚀 Features

* 🔗 Manages a single `BrowserWindow` instance
* 🎯 Full event emitter integration (custom events + system events)
* 🔄 Toggle visibility, fullscreen, maximize, minimize, focus, and closability
* 🌐 Supports external link handling with `shell.openExternal`
* 🔥 Easily open DevTools, set proxies, and load pages dynamically
* 📡 IPC-safe method to verify if messages are from the correct window
* 🗑️ Clean destroy handling with memory-safe event cleanup

---

## 🧠 Methods

### 🔥 Event System

| Method                             | Description                              |
| ---------------------------------- | ---------------------------------------- |
| `emit(event, ...args)`             | Emits an event                           |
| `on(event, listener)`              | Listen to an event                       |
| `once(event, listener)`            | Listen once                              |
| `off(event, listener)`             | Remove listener                          |
| `addListener(event, listener)`     | Alias of `on()`                          |
| `removeListener(event, listener)`  | Alias of `off()`                         |
| `removeAllListeners([event])`      | Remove all listeners                     |
| `listenerCount(event, [listener])` | Get listener count                       |
| `eventNames()`                     | Get all registered event names           |
| `listeners(event)`                 | Get listeners array                      |
| `rawListeners(event)`              | Get raw listeners                        |
| `setMaxListeners(n)`               | Set max listener count                   |
| `getMaxListeners()`                | Get max listener count                   |
| `getSysEvents()`                   | Get system event emitter (one-time only) |

---

### 🚪 Visibility & State

| Method                  | Description                     |
| ----------------------- | ------------------------------- |
| `toggleVisible([bool])` | Toggle or set window visibility |
| `isVisible()`           | Is window visible               |
| `isReady()`             | Is window ready-to-show         |

---

### 🪟 Window Control

| Method                     | Description          |
| -------------------------- | -------------------- |
| `loadPath(page, ops)`      | Load a page          |
| `openDevTools(ops?)`       | Open DevTools        |
| `setProxy(config)`         | Set network proxy    |
| `setMaximizable(value)`    | Set maximizable      |
| `isMaximizable()`          | Check maximizable    |
| `setClosable(value)`       | Set closable         |
| `isClosable()`             | Check closable       |
| `setFocusable(value)`      | Set focusable        |
| `isFocusable()`            | Check focusable      |
| `setFullScreenable(value)` | Set fullscreenable   |
| `isFullScreenable()`       | Check fullscreenable |

---

### 💌 Communication

| Method             | Description                                 |
| ------------------ | ------------------------------------------- |
| `ping(data)`       | Send a ping event with data to the renderer |
| `isFromWin(event)` | Check if an IPC event came from this window |

---

### 🏛️ Metadata

| Method                  | Description                          |
| ----------------------- | ------------------------------------ |
| `getIndex()`            | Get instance index                   |
| `getWin()`              | Get internal BrowserWindow           |
| `getAppEventKey(value)` | Convert AppEvents value to key       |
| `isValidAppEvent(val)`  | Check if a value is a valid AppEvent |

---

### ☠️ Destruction

| Method                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `destroy()`            | Destroy the window and clean listeners           |
| `isDestroyed()`        | Check if the window is destroyed                 |
| `isPreparingDestroy()` | Check if the window is preparing for destruction |

---

## 🛑 Events Broadcasted

| Event                                 | Description                    |
| ------------------------------------- | ------------------------------ |
| `AppEvents.ReadyToShow`               | Window ready to show           |
| `AppEvents.WindowIsVisible`           | Window shown/hidden            |
| `AppEvents.WindowIsMaximized`         | Window maximized/unmaximized   |
| `AppEvents.WindowIsFocused`           | Focus/blur status              |
| `AppEvents.WindowMove`                | Window moved                   |
| `AppEvents.WindowIsMaximizable`       | Maximizable status changed     |
| `AppEvents.WindowIsClosable`          | Closable status changed        |
| `AppEvents.WindowIsFullScreenable`    | Fullscreenable status changed  |
| `AppEvents.WindowIsFocusable`         | Focusable status changed       |
| `AppEvents.Resize/Resized/WillResize` | Resize related events          |
| `AppEvents.WindowIsFullScreen`        | Enter/exit fullscreen          |
| `RootEvents.ShowApp`                  | Visibility toggle (root level) |

---

## 💡 Example Usage

```js
import TinyWinInstance from './TinyWinInstance.js';

const win = new TinyWinInstance(
  {
    emit: (event, ...args) => console.log('Event:', event, ...args),
    loadPath: (win, page) => win.loadFile(page),
    openDevTools: (win) => win.webContents.openDevTools(),
    setProxy: (win, config) => win.webContents.session.setProxy(config),
  },
  {
    config: { width: 800, height: 600, show: false },
    index: 'main',
    show: true,
    openWithBrowser: true,
  }
);

win.on('ReadyToShow', () => console.log('Window is ready!'));
win.loadPath('index.html');
```

---

## 🎯 Summary

`TinyWinInstance` is a powerful, event-driven wrapper around `BrowserWindow`, making window management **safe**, **easy**, and **scalable** in complex Electron apps. ✨
