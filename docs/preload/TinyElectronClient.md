# TinyElectronClient 🚀

A powerful client API for managing Electron windows with fine-grained control over window states, events, and IPC communication.

---

## Table of Contents 📚

* [Overview](#overview)
* [Constructor](#constructor)
* [Window State Getters 🖼️](#window-state-getters-️)
* [Window State Setters ⚙️](#window-state-setters-️)
* [Window Actions 🎛️](#window-actions-️)
* [Event Management 🔔](#event-management-️)
* [Utility Functions 🧰](#utility-functions-️)
* [Loading Screen Control ⏳](#loading-screen-control-)
* [API Injection in Renderer 🌐](#api-injection-in-renderer-)

---

## Overview

`TinyElectronClient` is a client-side API designed to interact with Electron's main process via IPC. It handles window states (size, position, fullscreen, focus), visibility, proxy configuration, tray and app icon changes, and provides a loading screen control and developer tools integration.

---

## Constructor 🏗️

```js
constructor({ ipcReceiverChannel, eventNames } = {})
```

* `ipcReceiverChannel` (string, optional): Custom IPC channel name for responses.
* `eventNames` (object, optional): Custom set of internal event names.

Initializes IPC communication and sets up listeners for various window and app events.

---

## Window State Getters 🖼️

* `getBounds() => { x, y, width, height }`
  Returns the current window bounds.

* `getPosition() => [x, y]`
  Returns current window position.

* `getSize() => [width, height]`
  Returns current window size.

* `getShowStatus() => boolean`
  Returns if the app is shown or hidden.

* `isFullScreen() => boolean`
  Returns if window is fullscreen.

* `isMaximized() => boolean`
  Returns if window is maximized.

* `isFocused() => boolean`
  Returns if window is focused.

* `isVisible() => boolean`
  Returns if window is visible.

* `isMaximizable() => boolean`
  Returns if window can be maximized.

* `isClosable() => boolean`
  Returns if window can be closed.

* `isFullScreenable() => boolean`
  Returns if window can enter fullscreen.

* `isFocusable() => boolean`
  Returns if window can be focused.

---

## Window State Setters ⚙️

These setters generally send IPC requests to update the window state.

* `setMaximizable(value: boolean): Promise<boolean>`
  Set if window can be maximized.

* `setClosable(value: boolean): Promise<boolean>`
  Set if window can be closed.

* `setFocusable(value: boolean): Promise<boolean>`
  Set if window can be focused.

* `setFullScreenable(value: boolean): Promise<boolean>`
  Set if window can enter fullscreen.

* `setIsVisible(isVisible: boolean): Promise<boolean>`
  Set the internal visibility flag.

---

## Window Actions 🎛️

Async methods that send IPC commands to control window behavior.

* `show(): Promise<void>`
  Show the window.

* `hide(): Promise<void>`
  Hide the window.

* `close(): Promise<void>`
  Close the window.

* `destroy(): Promise<void>`
  Destroy the window (without quitting the app).

* `maximize(): Promise<void>`
  Maximize the window.

* `unmaximize(): Promise<void>`
  Restore window from maximized state.

* `minimize(): Promise<void>`
  Minimize the window.

* `focus(): Promise<void>`
  Focus the window.

* `forceFocus(): Promise<void>`
  Force the window to gain focus even if hidden.

* `blur(): Promise<void>`
  Remove focus from the window.

* `quit(): void`
  Request the app to quit immediately.

---

## Event Management 🔔

* Events from main process (resize, move, focus, fullscreen, etc.) are listened for and update internal state accordingly.
* `installWinScript(apiName, enabledMethods)`
  Injects a selected subset of API methods into the renderer window's global context via Electron's `contextBridge`.

---

## Utility Functions 🧰

* `getCache()`
  Returns cached window data.

* `getData()`
  Returns latest received window data.

* `getChangeCount(where: string)`
  Returns how many times a particular property changed.

* `getAllChangeCount()`
  Returns total count of changes.

* `getIpcRequest()`
  Access to the internal IPC request manager.

* `getWindowData(): Promise<WindowDataResult>`
  Requests current window data from the main process.

* `systemIdleTime(): Promise<number>`
  Returns system idle time in seconds.

* `systemIdleState(idleThreshold: number): Promise<"active" | "idle" | "locked" | "unknown">`
  Returns the current idle state.

* `getExecPath(): string`
  Returns absolute path of the running executable.

* `setProxy(config: Electron.ProxyConfig): Promise<void>`
  Update network proxy settings.

* `changeTrayIcon(img: string, key: string): Promise<void>`
  Change the tray icon image.

* `changeAppIcon(img: string): Promise<void>`
  Change the app/dock icon.

* `openDevTools(options?): Promise<void>`
  Opens Electron DevTools with optional config.

* `setTitle(title: string): Promise<void>`
  Sets the window title.

---

## Loading Screen Control ⏳

* `installLoadingPage(exposeInMainWorld = 'electronLoading', config)`
  Injects a loading screen API into the window, exposing methods:

  * `append()` — Append the loading screen elements.
  * `remove()` — Remove the loading screen elements.

---

## API Injection in Renderer 🌐

The method `installWinScript` exposes a controlled API object in the renderer process, enabling:

* Listening to window events (`on`, `off`, `once`).
* Controlling window behavior (maximize, minimize, focus, etc.).
* Accessing window state data.
* Showing/hiding window.
* Changing icons.
* Managing proxy and system idle info.

---

## Example

```js
const client = new TinyElectronClient();

client.installWinScript('electronWindow', [
  'focus',
  'maximize',
  'minimize',
  'setTitle',
  'getBounds',
]);

electronWindow.focus();
electronWindow.setTitle('Hello World!');
```

---

## Change Count Tracking 📊

* `getChangeCount(where: string): number`
  Returns the number of changes made to a particular property (like `'position'`, `'size'`, `'isFocused'`).

* `getAllChangeCount(): number`
  Returns the total count of all changes tracked internally.

---

## First Ping Tracking 💡

* `#firstPing(value: boolean, useIt: boolean)`
  Internal method that tracks if the window has received the initial ping from the main process.

* `isPinged(): boolean`
  Returns whether the window has been pinged for the first time.

---

## Event Emission and Listening 🔄

* `.on(event: string, listener: Function): void`
  Register an event listener.

* `.once(event: string, listener: Function): void`
  Register a one-time event listener.

* `.off(event: string, listener: Function): void`
  Remove an event listener.

---

## Window Show and Hide Status 🎭

* `isVisible(): boolean`
  Returns whether the window is currently visible.

* `getShowStatus(): boolean`
  Returns whether the application is shown (true) or hidden (false).

---

## IPC Request Access 🔌

* `getIpcRequest(): TinyIpcRequestManager`
  Returns the internal IPC request manager instance for custom requests.

---

## Window Data Fetching 🔍

* `getWindowData(): Promise<WindowDataResult>`
  Requests the current window data from the main process.

* `requestCache(): Promise<Record<string, *>>`
  Requests and updates internal cache from the main process.

---

## System Idle Information ⏱️

* `systemIdleTime(): Promise<number>`
  Returns system idle time in seconds.

* `systemIdleState(idleThreshold: number): Promise<'active' | 'idle' | 'locked' | 'unknown'>`
  Returns the system idle state.

---

## Example for Some Newly Added Methods

```js
const client = new TinyElectronClient();

// Listen for window maximize event
client.on('IsMaximized', (isMaximized) => {
  console.log('Window maximized:', isMaximized);
});

// Request current window data
client.getWindowData().then((data) => {
  console.log('Window data:', data);
});

// Change window visibility
client.setIsVisible(true);

// Track how many times size changed
console.log('Size changes:', client.getChangeCount('size'));
```
