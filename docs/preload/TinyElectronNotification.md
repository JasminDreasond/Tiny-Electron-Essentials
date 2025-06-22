# 🔔 TinyElectronNotification – Notification API for Electron

TinyElectronNotification is a fully event-driven notification system for Electron apps. It bridges the main and renderer processes over IPC, allowing you to create, show, close, and listen to events on notifications — just like a Node.js `EventEmitter`.

> ⚠️ **Experimental:** This API is still in beta and may change in future versions.

---

## 🚀 Features

* 🔗 Secure IPC-based notifications.
* 🏷️ Persistent notifications identified by a unique `tag`.
* 🎧 Full event handling (`on`, `once`, `off`, `addListener`, etc.).
* 📜 Clean lifecycle management (auto-cleans on close, click, reply, etc.).
* 🔥 Integrates with Electron’s `contextBridge`.

---

## 🏗️ Class: `TinyElectronNotification`

```js
import TinyElectronNotification from './TinyElectronNotification.js';
```

---

## 🔧 Constructor

```js
const notificationManager = new TinyElectronNotification({
  ipcRequest, // TinyIpcRequestManager instance (required)
  eventNames  // Optional: override event names
});
```

| Parameter    | Type                    | Description                                      |
| ------------ | ----------------------- | ------------------------------------------------ |
| `ipcRequest` | `TinyIpcRequestManager` | The IPC request manager instance (**required**)  |
| `eventNames` | `NotificationEvents`    | Optional custom event names (default internally) |

### ⚠️ Throws

* `Error` — If `ipcRequest` is not an instance of `TinyIpcRequestManager`.
* `Error` — If `eventNames` doesn't match the expected structure.

---

## 🌐 Method: `installWinScript(apiName)`

Exposes a notification factory function in the `window` context.

```js
notificationManager.installWinScript('newElectronNotification');
```

| Parameter | Type     | Default                     | Description                      |
| --------- | -------- | --------------------------- | -------------------------------- |
| `apiName` | `string` | `'newElectronNotification'` | The name under `window[apiName]` |

→ Then usable in the renderer:

```js
const notification = await window.newElectronNotification({
  title: 'Hello!',
  body: 'This is a message.',
  tag: 'uniqueId',
});
```

---

## 🎯 Method: `create(arg)`

Creates a new notification instance with event handling.

| Parameter | Type                             | Description                               |
| --------- | -------------------------------- | ----------------------------------------- |
| `arg`     | `NotificationConstructorOptions` | Notification settings, must include `tag` |

### Example:

```js
const notification = await notificationManager.create({
  title: 'Hi!',
  body: 'How are you?',
  tag: 'notify-123'
});
```

---

## 🔥 Notification Instance Methods

Each notification object supports:

| Method                           | Description                                    |
| -------------------------------- | ---------------------------------------------- |
| `isSupported()`                  | Returns `true` if notifications are supported. |
| `show()`                         | Shows the notification.                        |
| `close()`                        | Closes the notification.                       |
| `on(event, callback)`            | Adds an event listener.                        |
| `once(event, callback)`          | Adds a one-time listener.                      |
| `off(event, callback)`           | Removes a listener.                            |
| `addListener(event, cb)`         | Alias for `on()`.                              |
| `removeListener(event, cb)`      | Alias for `off()`.                             |
| `prependListener(event, cb)`     | Adds a listener to the beginning of listeners. |
| `prependOnceListener(event, cb)` | Same as `once` but prepends.                   |
| `setMaxListeners(count)`         | Sets the max number of listeners.              |
| `getMaxListeners()`              | Gets the max number of listeners.              |
| `listenerCount(event)`           | Returns number of listeners for event.         |
| `listeners(event)`               | Returns array of listener functions.           |
| `rawListeners(event)`            | Returns raw listener array.                    |
| `eventNames()`                   | Returns array of event names.                  |

---

## 📡 Notification Events

| Event Name | Description                                  |
| ---------- | -------------------------------------------- |
| `'show'`   | Fired when the notification is shown.        |
| `'click'`  | Fired when the user clicks the notification. |
| `'close'`  | Fired when the notification is closed.       |
| `'reply'`  | Fired when user replies (if supported).      |
| `'action'` | Fired when user clicks an action button.     |
| `'failed'` | Fired if the notification failed to display. |
| `'all'`    | Internal or general-purpose event dispatch.  |

---

## 🧠 Usage Example

### 🛠️ Preload script (`preload.js`):

```js
import TinyElectronNotification from './TinyElectronNotification.js';
import TinyIpcRequestManager from './TinyIpcRequestManager.js';

const ipcRequest = new TinyIpcRequestManager();
const notificationManager = new TinyElectronNotification({ ipcRequest });

notificationManager.installWinScript('newElectronNotification');
```

### 🚀 Renderer process:

```js
const notification = await window.newElectronNotification({
  title: 'Greetings!',
  body: 'This is your notification.',
  tag: 'notify-abc',
});

notification.on('show', () => console.log('Notification shown!'));
notification.on('click', () => console.log('Clicked!'));
notification.on('close', () => console.log('Closed!'));
notification.on('failed', (error) => console.error('Failed:', error));

notification.show();
```

---

## 💡 Notes

* 🏷️ **The `tag` is mandatory and must be unique** per notification instance.
* ♻️ Notifications automatically clean themselves after `'click'`, `'reply'`, `'action'`, `'close'`, and `'failed'`.
* 🚫 Prevents duplicated notifications using the same `tag`.
* 🎧 Fully powered by Node.js `EventEmitter` style event handling.
* 🔐 Safe communication between renderer and main process over IPC.

---

## 🏆 Credits

* Built with ❤️ for rich notification handling in Electron apps.
* Inspired by the native `Notification` API but with more power and flexibility for Electron.
