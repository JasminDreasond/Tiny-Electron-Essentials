import path from 'node:path';
import { EventEmitter } from 'events';
import { app, BrowserWindow, shell, ipcMain, Tray, Menu } from 'electron';
import { release } from 'node:os';

/**
 * @typedef {{
 *  index: number|null;
 *  visible: boolean;
 *  toggleVisible: (isVisible?: boolean) => boolean;
 * }} WindowStatus
 */

/** @typedef {{ instance: BrowserWindow; status: WindowStatus }} WinInstance */

class TinyElectronRoot {
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
  #appStarted = false;
  #winIds = -1;

  #title = '';
  #urlBase = '';
  #pathBase = '';

  #quitOnAllClosed = true;

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
   * @type {WinInstance | null}
   */
  #win = null;

  /**
   * A map of all created window instances indexed by their internal numeric ID.
   * @type {Map<number, WinInstance>}
   */
  #wins = new Map();

  /**
   * Executes initialization logic that must only run once.
   * Registers a listener for app quit and emits a creation event for the first window.
   */
  #execFirstTime() {
    if (!this.#firstTime) return;
    this.#firstTime = false;

    ipcMain.on('app-quit', () => {
      this.#isQuiting = true;
      app.quit();
    });

    this.#emit('CreateFirstWindow');
  }

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
   * Creates a new Electron BrowserWindow and tracks it as a main or secondary window.
   *
   * If marked as the main window, it will be assigned to `#win`. Otherwise, it's stored
   * in the `#wins` map using an auto-incremented index.
   *
   * @param {Electron.BrowserWindowConstructorOptions} config - Configuration for the new BrowserWindow.
   * @param {boolean} [isMain=false] - Whether this window is the main application window.
   */
  #createWindow(config, isMain = false) {
    if (typeof isMain !== 'boolean')
      throw new Error(
        `[Window Creation Error] Expected 'isMain' to be a boolean, but received: ${typeof isMain}`,
      );
    const win = new BrowserWindow(config);
    const index = isMain ? null : this.#winIds++;

    /** @type {WindowStatus} */
    const status = {
      index,
      visible: false,
      toggleVisible: (isVisible) => {
        if (typeof isVisible !== 'undefined' && typeof isVisible !== 'boolean')
          throw new Error(
            `[toggleVisible Error] Expected a boolean or undefined, but got: ${typeof isVisible}`,
          );

        const changeVisibleTo =
          typeof isVisible === 'boolean' ? isVisible : !newInstance.status.visible;

        if (changeVisibleTo) win?.show();
        else win?.hide();
        newInstance.status.visible = changeVisibleTo;
        this.#emit('ShowApp', index, changeVisibleTo);
        return changeVisibleTo;
      },
    };

    /** @type {WinInstance} */
    const newInstance = { instance: win, status };

    if (isMain) this.#win = newInstance;
    else this.#wins.set(typeof index === 'number' ? index : -1, newInstance);
  }

  /**
   * @param {Object} [settings={}]
   * @param {boolean} [settings.quitOnAllClosed=true]
   * @param {string} [settings.urlBase='']
   * @param {string} [settings.pathBase='']
   */
  constructor({ quitOnAllClosed = true, urlBase = '', pathBase = '' } = {}) {
    this.#quitOnAllClosed = quitOnAllClosed;
    this.#loadByUrl = urlBase.trim().length > 0 ? true : false;
    this.#urlBase = urlBase;
    this.#pathBase = pathBase;

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
        const status = this.getWinStatus();
        status.toggleVisible(true);
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
   * Checks whether a main window instance currently exists.
   * @returns {boolean}
   */
  existsWin() {
    return this.#win ? true : false;
  }

  /**
   * Returns the current main BrowserWindow instance.
   * Throws if no window is initialized.
   * @returns {BrowserWindow}
   * @throws {Error} If no main window exists.
   */
  getWin() {
    if (!this.#win)
      throw new Error(
        '[getWin Error] No main window has been created. Call create a new main window first.',
      );
    return this.#win.instance;
  }

  /**
   * Returns the status object associated with the main window.
   * @returns {WindowStatus}
   * @throws {Error} If no main window exists.
   */
  getWinStatus() {
    if (!this.#win)
      throw new Error(
        '[getWinStatus Error] Cannot retrieve status because no main window has been initialized.',
      );
    return this.#win.status;
  }

  /**
   * Returns the current application title.
   * @returns {string}
   * @throws {Error} If the title is not a string.
   */
  getTitle() {
    if (typeof this.#title !== 'string')
      throw new Error(
        '[getTitle Error] The application title has not been set or is not a valid string.',
      );
    return this.#title;
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
   * Initializes the app configuration, setting application name and title.
   *
   * On Windows, it sets the app user model ID for proper toast notifications.
   *
   * @param {Object} [options={}] - Configuration options.
   * @param {string} [options.name=app.getName()] - The internal name of the application.
   * @param {string} [options.title] - The title to be displayed in the application window.
   * @throws {Error} If `title` is not a string.
   */
  initConfig({ name = app.getName(), title } = {}) {
    if (typeof title !== 'string')
      throw new Error(
        '[initConfig Error] Expected "title" to be a string. Provide a valid application title.',
      );
    // Set application name for Windows 10+ notifications
    if (process.platform === 'win32') app.setAppUserModelId(name);
    this.#title = title;
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
  initApp() {
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
