import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'events';
import { app, BrowserWindow, ipcMain, session, powerMonitor, Tray, Menu } from 'electron';
import { release } from 'node:os';
import { isJsonObject } from 'tiny-essentials';
import TinyWinInstance from './WinInstance.mjs';
import TinyWindowFile from './TinyWindowFile.mjs';

/**
 * @typedef {Object} NewBrowserOptions - Configuration for the new BrowserWindow.
 * @property {Electron.BrowserWindowConstructorOptions} [config] - Configuration for the new BrowserWindow.
 * @property {Electron.AppDetailsOptions} [appDetails={ appId: this.getAppId(), appIconPath: this.#icon, relaunchDisplayName: this.getTitle() }] - Configuration for the browser app details.
 * @property {boolean} [openWithBrowser=this.#openWithBrowser] - if you will make all links open with the browser, not with the application.
 * @property {boolean} [autoShow=true] - The window will appear when the load is finished.
 * @property {string} [fileId] - (Optional) Id file of the window in the manager.
 * @property {string[]} [urls=['https:', 'http:']] - List of allowed URL protocols to permit external opening.
 * @property {boolean} [isMain=false] - Whether this window is the main application window.
 */

class TinyElectronRoot {
  #winFile = new TinyWindowFile();

  /**
   * Important instance used to make event emitter.
   * @type {EventEmitter}
   */
  #events = new EventEmitter();

  /**
   * Important instance used to make system event emitter.
   * @type {EventEmitter}
   */
  #sysEvents = new EventEmitter();
  #sysEventsUsed = false;

  /**
   * Provides access to a secure internal EventEmitter for subclass use only.
   *
   * This method exposes a dedicated EventEmitter instance intended specifically for subclasses
   * that extend the main class. It prevents subclasses from accidentally or intentionally using
   * the primary class's public event system (`emit`), which could lead to unpredictable behavior
   * or interference in the base class's event flow.
   *
   * For security and consistency, this method is designed to be accessed only once.
   * Multiple accesses are blocked to avoid leaks or misuse of the internal event bus.
   *
   * @returns {EventEmitter} A special internal EventEmitter instance for subclass use.
   * @throws {Error} If the method is called more than once.
   */
  getSysEvents() {
    if (this.#sysEventsUsed)
      throw new Error(
        'Access denied: getSysEvents() can only be called once. ' +
          'This restriction ensures subclass event isolation and prevents accidental interference ' +
          'with the main class event emitter.',
      );
    this.#sysEventsUsed = true;
    return this.#sysEvents;
  }

  /**
   * Emits an event with optional arguments to all system emit.
   * @param {string | symbol} event - The name of the event to emit.
   * @param {...any} args - Arguments passed to event listeners.
   */
  #emit(event, ...args) {
    this.#events.emit(event, ...args);
    if (this.#sysEventsUsed) this.#sysEvents.emit(event, ...args);
  }

  /**
   * @typedef {(...args: any[]) => void} ListenerCallback
   * A generic callback function used for event listeners.
   */

  /**
   * Sets the maximum number of listeners for the internal event emitter.
   *
   * @param {number} max - The maximum number of listeners allowed.
   */
  setMaxListeners(max) {
    this.#events.setMaxListeners(max);
  }

  /**
   * Emits an event with optional arguments.
   * @param {string | symbol} event - The name of the event to emit.
   * @param {...any} args - Arguments passed to event listeners.
   * @returns {boolean} `true` if the event had listeners, `false` otherwise.
   */
  emit(event, ...args) {
    return this.#events.emit(event, ...args);
  }

  /**
   * Registers a listener for the specified event.
   * @param {string | symbol} event - The name of the event to listen for.
   * @param {ListenerCallback} listener - The callback function to invoke.
   * @returns {this} The current class instance (for chaining).
   */
  on(event, listener) {
    this.#events.on(event, listener);
    return this;
  }

  /**
   * Registers a one-time listener for the specified event.
   * @param {string | symbol} event - The name of the event to listen for once.
   * @param {ListenerCallback} listener - The callback function to invoke.
   * @returns {this} The current class instance (for chaining).
   */
  once(event, listener) {
    this.#events.once(event, listener);
    return this;
  }

  /**
   * Removes a listener from the specified event.
   * @param {string | symbol} event - The name of the event.
   * @param {ListenerCallback} listener - The listener to remove.
   * @returns {this} The current class instance (for chaining).
   */
  off(event, listener) {
    this.#events.off(event, listener);
    return this;
  }

  /**
   * Alias for `on`.
   * @param {string | symbol} event - The name of the event.
   * @param {ListenerCallback} listener - The callback to register.
   * @returns {this} The current class instance (for chaining).
   */
  addListener(event, listener) {
    this.#events.addListener(event, listener);
    return this;
  }

  /**
   * Alias for `off`.
   * @param {string | symbol} event - The name of the event.
   * @param {ListenerCallback} listener - The listener to remove.
   * @returns {this} The current class instance (for chaining).
   */
  removeListener(event, listener) {
    this.#events.removeListener(event, listener);
    return this;
  }

  /**
   * Removes all listeners for a specific event, or all events if no event is specified.
   * @param {string | symbol} [event] - The name of the event. If omitted, all listeners from all events will be removed.
   * @returns {this} The current class instance (for chaining).
   */
  removeAllListeners(event) {
    this.#events.removeAllListeners(event);
    return this;
  }

  /**
   * Returns the number of times the given `listener` is registered for the specified `event`.
   * If no `listener` is passed, returns how many listeners are registered for the `event`.
   * @param {string | symbol} eventName - The name of the event.
   * @param {Function} [listener] - Optional listener function to count.
   * @returns {number} Number of matching listeners.
   */
  listenerCount(eventName, listener) {
    return this.#events.listenerCount(eventName, listener);
  }

  /**
   * Adds a listener function to the **beginning** of the listeners array for the specified event.
   * The listener is called every time the event is emitted.
   * @param {string | symbol} eventName - The event name.
   * @param {ListenerCallback} listener - The callback function.
   * @returns {this} The current class instance (for chaining).
   */
  prependListener(eventName, listener) {
    this.#events.prependListener(eventName, listener);
    return this;
  }

  /**
   * Adds a **one-time** listener function to the **beginning** of the listeners array.
   * The next time the event is triggered, this listener is removed and then invoked.
   * @param {string | symbol} eventName - The event name.
   * @param {ListenerCallback} listener - The callback function.
   * @returns {this} The current class instance (for chaining).
   */
  prependOnceListener(eventName, listener) {
    this.#events.prependOnceListener(eventName, listener);
    return this;
  }

  /**
   * Returns an array of event names for which listeners are currently registered.
   * @returns {(string | symbol)[]} Array of event names.
   */
  eventNames() {
    return this.#events.eventNames();
  }

  /**
   * Gets the current maximum number of listeners allowed for any single event.
   * @returns {number} The max listener count.
   */
  getMaxListeners() {
    return this.#events.getMaxListeners();
  }

  /**
   * Returns a copy of the listeners array for the specified event.
   * @param {string | symbol} eventName - The event name.
   * @returns {Function[]} An array of listener functions.
   */
  listeners(eventName) {
    return this.#events.listeners(eventName);
  }

  /**
   * Returns a copy of the internal listeners array for the specified event,
   * including wrapper functions like those used by `.once()`.
   * @param {string | symbol} eventName - The event name.
   * @returns {Function[]} An array of raw listener functions.
   */
  rawListeners(eventName) {
    return this.#events.rawListeners(eventName);
  }

  // Don't touch
  #loadByUrl = false;
  #firstTime = true;
  #appReady = false;
  #isQuiting = false;
  #winIds = -1;

  #appId;
  #title;
  #urlBase;
  #pathBase;
  #icon;

  #quitOnAllClosed;
  #openWithBrowser;

  #appDataName;

  /** @type {Record<string, string>} */
  #appDataStarted = {};

  /**
   * Warning message shown in the developer console when opened.
   * Intended to alert users about potential risks of pasting untrusted code.
   * @type {string[]}
   */
  #consoleOpenWarn = [
    `%cThis is a developer console! Putting weird things can result in theft of accounts or crashing your machine! Do not trust strange people asking you to paste things here!`,
    'color:red; font-size: 12pt; font-weight: 700;',
  ];

  /**
   * Indicates whether this instance has acquired the lock to run.
   * Can be null (not yet determined), or a boolean result.
   * @type {null|boolean}
   */
  #gotTheLock = null;

  /**
   * The current active window instance, or null if none exists.
   * @type {TinyWinInstance | null}
   */
  #win = null;

  /**
   * A map of all created window instances indexed by their internal numeric ID.
   * @type {Map<number|string, TinyWinInstance>}
   */
  #wins = new Map();

  /**
   * Ensures the provided value is a valid Electron BrowserWindow instance.
   * @param {BrowserWindow} win - The window object to validate.
   * @throws {Error} If the value is not an instance of BrowserWindow.
   */
  #isBrowserWindow(win) {
    if (!(win instanceof BrowserWindow))
      throw new Error('Expected win to be an instance of Electron.BrowserWindow.');
  }

  /**
   * Executes initialization logic that must only run once.
   * Registers a listener for app quit and emits a creation event for the first window.
   */
  #execFirstTime() {
    if (!this.#firstTime) return;
    this.#firstTime = false;

    /**
     * @param {Electron.IpcMainEvent} event
     * @returns {BrowserWindow|null}
     */
    const getWin = (event) => {
      const webContents = event.sender;
      if (!event.senderFrame) return null;
      const win = BrowserWindow.fromWebContents(webContents);
      if (win) return win;
      return null;
    };

    /**
     * @param {Electron.IpcMainEvent} event
     * @returns {TinyWinInstance|null}
     */
    const getWinInstance = (event) => {
      const webContents = event.sender;
      if (!event.senderFrame) return null;
      const win = BrowserWindow.fromWebContents(webContents);
      if (win) {
        if (this.#win && win.id === this.#win.getWin().id) return this.#win;
        /** @type {TinyWinInstance|null} */
        let result = null;
        this.#wins.forEach((value) => {
          if (!result && win.id === value.getWin().id) result = value;
        });
        return result;
      }
      return null;
    };

    ipcMain.on('openDevTools', (event) => {
      const win = getWin(event);
      if (win) this.openDevTools(win);
    });

    ipcMain.on('set-title', (event, title) => {
      const win = getWin(event);
      if (win) win.setTitle(title);
    });

    ipcMain.on('tiny-focus-window', (event) => {
      const win = getWin(event);
      if (win)
        setTimeout(() => {
          const win = getWin(event);
          if (win) win.focus();
        }, 200);
    });

    ipcMain.on('tiny-blur-window', (event) => {
      const win = getWin(event);
      if (win)
        setTimeout(() => {
          const win = getWin(event);
          if (win) win.blur();
        }, 200);
    });

    ipcMain.on('tiny-show-window', (event) => {
      const win = getWin(event);
      if (win)
        setTimeout(() => {
          const win = getWin(event);
          if (win) win.show();
        }, 200);
    });

    ipcMain.on('tiny-force-focus-window', (event) => {
      const win = getWin(event);
      if (win)
        setTimeout(() => {
          const win = getWin(event);
          if (win) {
            win.show();
            win.focus();
          }
        }, 200);
    });

    ipcMain.on('systemIdleTime', (event) => {
      const win = getWin(event);
      if (win) {
        const idleSecs = powerMonitor.getSystemIdleTime();
        win.webContents.send('systemIdleTime', idleSecs);
      }
    });

    ipcMain.on('systemIdleState', (event, value) => {
      const win = getWin(event);
      if (win) {
        const idleSecs = powerMonitor.getSystemIdleState(value);
        win.webContents.send('systemIdleState', idleSecs);
      }
    });

    ipcMain.on('windowIsVisible', (event, isVisible) => {
      const win = getWinInstance(event);
      if (win) win.toggleVisible(isVisible === true);
    });

    ipcMain.on('app-quit', () => this.quit());

    /**
     * Set proxy
     * @type {(event: Electron.IpcMainEvent, config: Electron.ProxyConfig) => void}
     */
    ipcMain.on('set-proxy', (event, config) => {
      const win = getWin(event);
      if (win && win.webContents) {
        win.webContents.session
          .setProxy(config)
          .then((result) => {
            if (win && win.webContents) win.webContents.send('set-proxy', result);
          })
          .catch((err) => {
            if (win && win.webContents)
              win.webContents.send('set-proxy-error', {
                code: err.code,
                message: err.message,
                cause: err.cause,
                stack: err.stack,
              });
          });
      }
    });

    // Window status
    ipcMain.on('window-is-maximized', (event) => {
      const win = getWin(event);
      if (win && win.webContents) {
        win.webContents.send('window-is-maximized', win.isMaximized());
      }
    });

    ipcMain.on('window-maximize', (event) => {
      const win = getWin(event);
      if (win) win.maximize();
    });

    ipcMain.on('window-unmaximize', (event) => {
      const win = getWin(event);
      if (win) win.unmaximize();
    });

    ipcMain.on('window-minimize', (event) => {
      const win = getWin(event);
      if (win) win.minimize();
    });

    ipcMain.on('window-hide', (event) => {
      const win = getWinInstance(event);
      if (win) win.toggleVisible(false);
    });

    this.#emit('CreateFirstWindow');
  }

  /**
   * Returns the internal TinyWindowFile instance.
   * @returns {TinyWindowFile}
   */
  getWinFile() {
    return this.#winFile;
  }

  /**
   * Creates a new Electron BrowserWindow and tracks it as a main or secondary window.
   *
   * If marked as the main window, it will be assigned to `#win`. Otherwise, it's stored
   * in the `#wins` map using an auto-incremented index.
   *
   * @param {NewBrowserOptions} [settings={}] - Configuration for the new BrowserWindow
   * @returns {TinyWinInstance}
   * @throws {Error} If settings is not an object.
   * @throws {Error} If trying to create a second main window.
   */
  createWindow({
    config,
    fileId,
    appDetails = {
      appId: this.getAppId(),
      appIconPath: this.#icon,
      relaunchDisplayName: this.getTitle(),
    },
    urls = ['https:', 'http:'],
    openWithBrowser = this.#openWithBrowser,
    autoShow = true,
    isMain = false,
  } = {}) {
    // Validate input
    if (!isJsonObject(appDetails)) throw new Error('Expected "appDetails" to be a object.');
    if (typeof isMain !== 'boolean') throw new Error('Expected "isMain" to be a boolean.');
    if (isMain && this.#win) throw new Error('Main window already exists. Cannot create another.');

    // New instance
    const index = this.#winIds++;
    const newInstance = new TinyWinInstance((event, ...args) => this.emit(event, ...args), {
      config,
      openWithBrowser,
      autoShow,
      urls,
      index,
    });

    const win = newInstance.getWin();

    // Insert app details
    if (process.platform === 'win32') win.setAppDetails(appDetails);

    // Prevent Close
    win.on('close', (event) => {
      if (typeof fileId === 'string') {
        const winData = this.#winFile.getData(fileId);
        fs.writeFileSync(fileId, JSON.stringify(winData));
      }

      if (newInstance.isReady()) {
        if (!this.isQuiting()) {
          event.preventDefault();
          newInstance.toggleVisible(false);
        }
        return false;
      }
    });

    // Complete
    if (isMain) this.#win = newInstance;
    else this.#wins.set(typeof index === 'number' ? index : -1, newInstance);
    return newInstance;
  }

  /**
   * Initializes the core application configuration and sets up essential app behaviors.
   *
   * This constructor sets up base application options such as window behavior,
   * app identification, and URL handling. It also defines internal lifecycle events
   * for handling window closures, second instance attempts, and macOS dock activations.
   *
   * - On **Windows**, it sets the App User Model ID to allow native toast notifications.
   * - On **macOS**, it recreates the window when the dock icon is clicked and no windows are open.
   * - When a second instance is started, it focuses the existing window instead of launching a new one.
   *
   * @param {Object} [settings={}] - Configuration settings for the application.
   * @param {boolean} [settings.quitOnAllClosed=true] - Whether the app should quit when all windows are closed.
   * @param {boolean} [settings.openWithBrowser=true] - Whether to allow fallback opening in the system browser.
   * @param {string} [settings.urlBase] - The base URL for loading content if using remote sources.
   * @param {string} [settings.pathBase] - The local path used for loading static files if not using a URL.
   * @param {string} [settings.icon] - The icon of the application.
   * @param {string} [settings.title] - The title of the application.
   * @param {string} [settings.appId] - The unique App User Model ID (used for Windows notifications).
   * @param {string} [settings.appDataName] - The appData application name used by folder names.
   * @param {string} [settings.name=app.getName()] - The internal application name used by Electron APIs.
   *
   * @throws {Error} If any required string values (`urlBase`, `pathBase`, `title`, `appId`) are missing or not strings.
   * @throws {Error} If `openWithBrowser` or `quitOnAllClosed` are not boolean values.
   */
  constructor({
    quitOnAllClosed = true,
    openWithBrowser = true,
    name = app.getName(),
    icon,
    urlBase,
    pathBase,
    appId,
    title,
    appDataName,
  } = {}) {
    if (typeof urlBase !== 'string')
      throw new Error('Expected "urlBase" to be a string. Provide a valid application urlBase.');
    if (typeof pathBase !== 'string')
      throw new Error('Expected "pathBase" to be a string. Provide a valid application pathBase.');
    if (typeof title !== 'string')
      throw new Error('Expected "title" to be a string. Provide a valid application title.');
    if (typeof appId !== 'string')
      throw new Error('Expected "appId" to be a string. Provide a valid application appId.');
    if (typeof icon !== 'string')
      throw new Error('Expected "icon" to be a string. Provide a valid application icon.');
    if (typeof appDataName !== 'string')
      throw new Error(
        'Expected "appDataName" to be a string. Provide a valid application appDataName.',
      );

    if (typeof openWithBrowser !== 'boolean')
      throw new Error(
        'Expected "openWithBrowser" to be a boolean. Provide a valid application openWithBrowser.',
      );
    if (typeof quitOnAllClosed !== 'boolean')
      throw new Error(
        'Expected "quitOnAllClosed" to be a boolean. Provide a valid application quitOnAllClosed.',
      );

    this.#appDataName = appDataName;
    this.#quitOnAllClosed = quitOnAllClosed;
    this.#openWithBrowser = openWithBrowser;
    this.#loadByUrl = urlBase.trim().length > 0 ? true : false;
    this.#urlBase = urlBase;
    this.#pathBase = pathBase;
    this.#title = title;
    this.#appId = appId;
    this.#icon = icon;

    // Set application name for Windows 10+ notifications
    if (process.platform === 'win32') app.setAppUserModelId(name);

    app.on('window-all-closed', () => {
      if (this.#quitOnAllClosed) {
        this.#win = null;
        this.#wins.clear();
        this.#isQuiting = true;
        if (process.platform !== 'darwin') app.quit();
      }
    });

    // Someone tried to run a second instance, we should focus our window.
    app.on('second-instance', () => {
      if (this.existsWin()) {
        const instance = this.getWinInstance();
        instance.toggleVisible(true);
        const win = this.getWin();
        if (win.isMinimized()) {
          win.restore();
        }
        win?.focus();
      }
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      const allWindows = BrowserWindow.getAllWindows();
      if (allWindows.length) allWindows[0].focus();
      else this.#execFirstTime();
    });
  }

  /**
   * Checks if a specific CLI argument was provided when starting the application.
   *
   * This method scans `process.argv` to determine whether a particular argument
   * (exact match) was passed via the command line. It's useful for enabling or
   * disabling behaviors at runtime based on flags.
   *
   * @param {string} name - The exact argument name to search for (e.g., "--debug").
   * @returns {boolean} `true` if the argument was found; otherwise, `false`.
   */
  hasCliArg(name) {
    if (!Array.isArray(process.argv)) return false;
    for (const argName of process.argv)
      if (typeof argName === 'string' && argName === name) return true;
    return false;
  }

  /**
   * Signals the application to quit and sets the internal quit flag.
   *
   * This method marks the app as intentionally quitting and then calls `app.quit()`.
   * If called more than once, it has no additional effect beyond the first invocation.
   */
  quit() {
    this.#isQuiting = true;
    app.quit();
  }

  /**
   * Returns a copy of the developer console warning message array.
   * @returns {string[]}
   */
  getConsoleWarning() {
    return [...this.#consoleOpenWarn];
  }

  /**
   * Sets the warning messages to be displayed in the developer console.
   * Expects an array of two strings: the message and its CSS style.
   * @param {string[]} value
   */
  setConsoleWarning(value) {
    if (!Array.isArray(value) || !value.every((v) => typeof v === 'string'))
      throw new Error('consoleOpenWarn must be an array of strings.');
    this.#consoleOpenWarn = [value[0], value[1]];
  }

  /**
   * Checks if this is the first time the application logic is running.
   * @returns {boolean}
   */
  isFirstTime() {
    return this.#firstTime;
  }

  /**
   * Indicates whether the application is ready.
   * @returns {boolean}
   */
  isAppReady() {
    return this.#appReady;
  }

  /**
   * Indicates whether the application is in the process of quitting.
   * @returns {boolean}
   */
  isQuiting() {
    return this.#isQuiting;
  }

  /**
   * Checks whether a main window or a specific secondary window exists.
   *
   * If a `key` is provided, this method will check for the existence of a secondary window
   * in the internal map of windows. Only string keys are allowed.
   *
   * @param {string|number} [key] - Optional key to check existence of a specific secondary window.
   * @returns {boolean}
   * @throws {Error} If the provided key is not a string.
   */
  existsWin(key) {
    if (typeof key === 'undefined') return !!this.#win;
    if (typeof key !== 'string' && typeof key !== 'number')
      throw new Error(
        `[existsWin Error] Invalid key type "${typeof key}". Only string or number keys are supported.`,
      );
    return this.#wins.has(key);
  }

  /**
   * Returns the current main BrowserWindow instance or a specific one by key.
   *
   * If a `key` is provided, this method will attempt to retrieve a secondary window
   * from the internal map of windows. Only string keys are accepted.
   *
   * @param {string|number} [key] - Optional key to retrieve a specific secondary window.
   * @returns {BrowserWindow}
   * @throws {Error} If no main window exists, key is not a string, or the key does not match any window.
   */
  getWin(key) {
    if (typeof key === 'undefined') {
      if (!this.#win)
        throw new Error(
          '[getWin Error] No main window has been created. Call create a new main window first.',
        );
      return this.#win.getWin();
    }

    if (typeof key !== 'string' && typeof key !== 'number')
      throw new Error(
        `[getWin Error] Invalid key type "${typeof key}". Only string or number keys are supported.`,
      );

    /** @type {TinyWinInstance|undefined} */
    const winObj = this.#wins.get(key);
    if (!winObj)
      throw new Error(
        `[getWin Error] No window found for the given key "${key}". Check if the window was created.`,
      );
    return winObj.getWin();
  }

  /**
   * Returns the TinyWinInstance object associated with the main window or a specific one by key.
   *
   * If a `key` is provided, this method will attempt to retrieve a secondary window
   * instance from the internal map of windows. Only string keys are supported.
   *
   * @param {string|number} [key] - Optional key to retrieve a specific secondary window instance.
   * @returns {TinyWinInstance}
   * @throws {Error} If no main window exists, key is not a string, or the key does not match any window.
   */
  getWinInstance(key) {
    if (typeof key === 'undefined') {
      if (!this.#win)
        throw new Error(
          '[getWinInstance Error] Cannot retrieve main instance because no main window has been initialized.',
        );
      return this.#win;
    }

    if (typeof key !== 'string' && typeof key !== 'number')
      throw new Error(
        `[getWinInstance Error] Invalid key type "${typeof key}". Only string or number keys are supported.`,
      );

    /** @type {TinyWinInstance|undefined} */
    const instance = this.#wins.get(key);
    if (!instance)
      throw new Error(
        `[getWinInstance Error] No window instance found for the given key "${key}".`,
      );

    return instance;
  }

  /**
   * @typedef {"home"|"appData"|"userData"|"sessionData"|"temp"|"exe"|"module"|"desktop"|"documents"|"downloads"|"music"|"pictures"|"videos"|"recent"|"logs"|"crashDumps"} ElectronPathName
   */

  /**
   * Returns the full path to a folder inside the Electron app's unpacked directory.
   *
   * Useful when accessing files that must remain unpacked (e.g. native binaries).
   * Validates inputs and throws if any parameter is not a string.
   *
   * @param {string|null} [where] - The folder name to append inside the unpacked directory.
   * @param {string} [packName='app.asar'] - The packed archive filename (usually "app.asar").
   * @param {string} [unpackName='app.asar.unpacked'] - The corresponding unpacked folder name (usually "app.asar.unpacked").
   * @returns {{ isUnpacked: boolean, unPackedFolder: string }} Object with unpacked folder path and status.
   * @throws {Error} If any parameter is not a valid string.
   */
  getUnpackedFolder(where, packName = 'app.asar', unpackName = 'app.asar.unpacked') {
    if (
      typeof where !== 'undefined' &&
      where !== null &&
      (typeof where !== 'string' || !where.trim())
    )
      throw new Error(`Invalid "where" argument: expected non-empty string, got ${typeof where}`);
    if (typeof packName !== 'string' || !packName.trim())
      throw new Error(
        `Invalid "packName" argument: expected non-empty string, got ${typeof packName}`,
      );
    if (typeof unpackName !== 'string' || !unpackName.trim())
      throw new Error(
        `Invalid "unpackName" argument: expected non-empty string, got ${typeof unpackName}`,
      );

    const basePath = app.getAppPath();
    const unPackedFolder = basePath.replace(packName, unpackName);
    const isUnpacked = unPackedFolder.endsWith(unpackName);

    return {
      isUnpacked,
      unPackedFolder: typeof where === 'string' ? path.join(unPackedFolder, where) : unPackedFolder,
    };
  }

  /**
   * Loads a Chromium extension from a specified folder and extension name.
   *
   * This method attempts to load the extension first from the unpacked folder.
   * If that fails, it tries to load from a fallback path.
   *
   * @param {string} extName - The name of the extension's folder.
   * @param {string} folder - Folder name inside the unpacked app path where the extension is located.
   * @param {Electron.LoadExtensionOptions} [ops] - Optional Electron extension loading options.
   * @returns {Promise<Electron.Extension>} A promise that resolves with the loaded extension.
   * @throws {Error} If any required argument is missing or invalid.
   * @throws {Error} If the extension fails to load from both primary and fallback paths.
   *
   * @beta
   */
  async loadExtension(extName, folder, ops) {
    if (
      typeof folder !== 'undefined' &&
      folder !== null &&
      (typeof folder !== 'string' || !folder.trim())
    )
      throw new Error(`Invalid "folder" argument: expected non-empty string, got ${typeof folder}`);
    if (typeof extName !== 'string' || !extName.trim())
      throw new Error(
        `Invalid "extName" argument: expected non-empty string, got ${typeof extName}`,
      );

    const { unPackedFolder, isUnpacked } = this.getUnpackedFolder(folder);
    if (isUnpacked) {
      try {
        const result = await session.defaultSession.extensions.loadExtension(
          path.join(unPackedFolder, `./${extName}`),
          ops,
        );
        return result;
      } catch {
        try {
          const result = await session.defaultSession.extensions.loadExtension(
            path.join(__dirname, `../${extName}`),
            ops,
          );
          return result;
        } catch (err) {
          throw err;
        }
      }
    } else {
      try {
        const result = await session.defaultSession.extensions.loadExtension(
          path.join(__dirname, `../${extName}`),
          ops,
        );
        return result;
      } catch (err) {
        throw err;
      }
    }
  }

  /**
   * Initializes the base folder in the given Electron path if not already created.
   * Throws if the folder was already initialized.
   *
   * @param {ElectronPathName} [name] - The Electron path key to use as root.
   * @returns {string} The absolute path of the created folder.
   * @throws {Error} If the folder for this path was already initialized.
   */
  initAppDataDir(name = 'appData') {
    if (typeof name !== 'string')
      throw new Error(`Invalid key type "${typeof name}". Only string keys are supported.`);

    if (typeof this.#appDataStarted[name] === 'string')
      throw new Error(`App data for path "${name}" has already been initialized.`);
    const folder = path.join(app.getPath(name), this.#appDataName);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    this.#appDataStarted[name] = folder;
    return folder;
  }

  /**
   * Retrieves the base folder path previously initialized via `initAppDataDir()`.
   *
   * @param {ElectronPathName} [name] - The Electron path key.
   * @returns {string} The initialized app data folder path.
   * @throws {Error} If the folder was not yet initialized.
   */
  getAppDataDir(name = 'appData') {
    if (typeof name !== 'string')
      throw new Error(`Invalid key type "${typeof name}". Only string keys are supported.`);

    if (typeof this.#appDataStarted[name] !== 'string')
      throw new Error(`App data root for path "${name}" has not been initialized.`);
    return this.#appDataStarted[name];
  }

  /**
   * Creates a subdirectory inside the initialized base app data folder.
   * Throws if the subfolder was already created.
   *
   * @param {string} subdir - The name of the subfolder to create.
   * @param {ElectronPathName} [name] - The Electron path key.
   * @returns {string} The full path to the created subdirectory.
   * @throws {Error} If the subdirectory already exists in memory tracking.
   */
  initAppDataSubdir(subdir, name = 'appData') {
    if (typeof name !== 'string')
      throw new Error(`Invalid key type "${typeof name}". Only string keys are supported.`);
    if (typeof subdir !== 'string')
      throw new Error(`Invalid key type "${typeof subdir}". Only string keys are supported.`);

    const root = this.getAppDataDir(name);
    const id = `${name}:${subdir}`;

    if (typeof this.#appDataStarted[id] === 'string')
      throw new Error(`App data subdir "${subdir}" under "${name}" has already been created.`);
    const folder = path.join(root, subdir);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    this.#appDataStarted[id] = folder;
    return folder;
  }

  /**
   * Retrieves a previously created subdirectory path.
   *
   * @param {string} subdir - The name of the subfolder.
   * @param {ElectronPathName} [name] - The Electron path key.
   * @returns {string} The absolute path of the subdirectory.
   * @throws {Error} If the subdirectory was not previously created.
   */
  getAppDataSubdir(subdir, name = 'appData') {
    if (typeof name !== 'string')
      throw new Error(`Invalid key type "${typeof name}". Only string keys are supported.`);
    if (typeof subdir !== 'string')
      throw new Error(`Invalid key type "${typeof subdir}". Only string keys are supported.`);

    const id = `${name}:${subdir}`;
    if (typeof this.#appDataStarted[id] !== 'string')
      throw new Error(`App data subdir "${subdir}" under "${name}" has not been initialized.`);

    return this.#appDataStarted[id];
  }

  /**
   * Returns the current application appData folder name.
   * @returns {string}
   */
  getAppDataName() {
    return this.#appDataName;
  }

  /**
   * Returns the current application icon path.
   * @returns {string}
   */
  getIcon() {
    return this.#icon;
  }

  /**
   * Returns the current application title.
   * @returns {string}
   */
  getTitle() {
    return this.#title;
  }

  /**
   * Returns the current application app id.
   * @returns {string}
   */
  getAppId() {
    return this.#appId;
  }

  /**
   * Indicates whether this instance has acquired the lock to run.
   * Can be null (not yet determined), or a boolean result.
   * @returns {null|boolean}
   */
  gotTheLock() {
    return this.#gotTheLock;
  }

  /**
   * Opens the developer tools for the given BrowserWindow.
   * Also sends the custom console warning message to the devtools console.
   * @param {Electron.BrowserWindow} win - The target BrowserWindow instance.
   */
  openDevTools(win) {
    this.#isBrowserWindow(win);
    win.webContents.openDevTools();
    win.webContents.send('console-message', this.#consoleOpenWarn[0], this.#consoleOpenWarn[1]);
  }

  /**
   * Installs platform-specific protections for Windows systems.
   *
   * Currently disables GPU acceleration for Windows 7 (version 6.1).
   */
  installWinProtection() {
    // Disable GPU Acceleration for Windows 7
    if (release().startsWith('6.1')) app.disableHardwareAcceleration();
  }

  /**
   * Initializes the application by ensuring a single instance is running.
   *
   * If another instance is already running, it exits. Otherwise,
   * it sets up Electron readiness events and prepares the app.
   */
  init() {
    this.#gotTheLock = app.requestSingleInstanceLock();
    if (!this.#gotTheLock) {
      app.quit();
      process.exit(0);
    } else {
      // This method will be called when Electron has finished
      // initialization and is ready to create browser windows.
      // Some APIs can only be used after this event occurs.
      app.whenReady().then(() => this.#execFirstTime());
      app.on('ready', () => {
        if (this.#appReady) return;
        this.#appReady = true;
        this.#emit('Ready');
      });
    }
  }

  /**
   * Loads a page into the given BrowserWindow.
   *
   * Depending on configuration, it can load a local file path or a URL.
   *
   * @param {BrowserWindow} win - The target BrowserWindow instance.
   * @param {string|string[]} page - The page or path segments to load.
   * @param {Electron.LoadFileOptions|Electron.LoadURLOptions} ops - Options passed to `loadFile` or `loadURL`.
   */
  loadPath(win, page, ops) {
    this.#isBrowserWindow(win);
    if (this.#loadByUrl) {
      const url = new URL(this.#urlBase);
      const pathname = [url.pathname, ...page].filter(Boolean).join('/');

      /** @type {Electron.LoadURLOptions} */
      // @ts-ignore
      const options = ops;
      win.loadURL(pathname, options);
    } else {
      /** @type {Electron.LoadFileOptions} */
      // @ts-ignore
      const options = ops;
      win.loadFile(path.join(this.#pathBase, ...page), options);
    }
  }
}

export default TinyElectronRoot;
