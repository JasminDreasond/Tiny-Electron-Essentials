import { BrowserWindow, shell } from 'electron';
import { isJsonObject } from 'tiny-essentials';
import { AppEvents, RootEvents } from '../global/Events.mjs';
import { checkEventsList } from '../global/Utils.mjs';

/**
 * Represents a single managed Electron BrowserWindow instance.
 *
 * This class tracks visibility, readiness, and index of the window.
 * It allows toggling visibility and storing references to the parent controller and window instance.
 */
class TinyWinInstance {
  /** @typedef {function(string | symbol, ...any): void} Emit */
  /** @typedef {(win: Electron.BrowserWindow, ops?: Electron.OpenDevToolsOptions) => void} OpenDevTools */
  /** @typedef {(win: Electron.BrowserWindow, config: Electron.ProxyConfig) => void} SetProxy */
  /** @typedef {(win: Electron.BrowserWindow, page: string|string[], ops?: Electron.LoadFileOptions|Electron.LoadURLOptions) => void} LoadPath */

  #AppEvents = AppEvents;

  #checkDestroy() {
    if (!this.#win || this.#win.isDestroyed?.())
      throw new Error('The BrowserWindow instance "win" is not available or has been destroyed.');
  }

  /**
   * Checks if a given value exists in the AppEvents values.
   *
   * @param {string} value - The value to check for.
   * @returns {boolean} True if the value exists, false otherwise.
   */
  isValidAppEvent(value) {
    return Object.keys(this.#AppEvents).includes(value);
  }

  /**
   * Gets the key (event name) associated with a given AppEvents value.
   *
   * @param {string} value - The value to look up.
   * @returns {string} The matching AppEvents key.
   * @throws {Error} If the value is not found.
   */
  getAppEventKey(value) {
    if (!this.isValidAppEvent(value)) throw new Error(`AppEvent value "${value}" not found.`);
    // @ts-ignore
    if (typeof this.#AppEvents[value] !== 'string')
      throw new Error(`AppEvent value "${value}" is invalid.`);
    // @ts-ignore
    return this.#AppEvents[value];
  }

  #visible = false;
  #ready = false;

  /** @type {string|number|null} */
  #index = null;

  /** @type {BrowserWindow} */
  #win;

  /**
   * Emits an event with optional arguments.
   * @type {Emit}
   */
  #emit;

  /**
   * @type {OpenDevTools}
   */
  #openDevTools;

  /**
   * @type {SetProxy}
   */
  #setProxy;

  /**
   * @type {LoadPath}
   */
  #loadPath;

  /**
   * Returns the window index assigned to this instance.
   * @returns {string|number|null}
   */
  getIndex() {
    return this.#index;
  }

  /**
   * Checks whether the window is currently visible.
   * @returns {boolean}
   */
  isVisible() {
    return this.#visible;
  }

  /**
   * Checks whether the window is marked as ready.
   * @returns {boolean}
   */
  isReady() {
    return this.#ready;
  }

  /**
   * Loads a page. Depending on configuration, it can load a local file path or a URL.
   *
   * @param {string|string[]} page - The page or path segments to load.
   * @param {Electron.LoadFileOptions|Electron.LoadURLOptions} [ops] - Options passed to `loadFile` or `loadURL`.
   * @throws {TypeError} If page is not a string or string[].
   * @throws {TypeError} If page contains non-string entries.
   * @throws {TypeError} If ops is not an object.
   */
  loadPath(page, ops) {
    this.#checkDestroy();
    return this.#loadPath(this.#win, page, ops);
  }

  /**
   * Opens the developer tools.
   * Also sends the custom console warning message to the devtools console.
   * @param {Electron.OpenDevToolsOptions} [ops] - The target DevTools config.
   */
  openDevTools(ops) {
    this.#checkDestroy();
    return this.#openDevTools(this.#win, ops);
  }

  /**
   * Applies a network proxy configuration.
   *
   * This method sets the proxy settings for the session.
   * Upon completion, it emits events back to the renderer process to indicate success or failure.
   *
   * @param {Electron.ProxyConfig} config - The proxy configuration object following Electron's ProxyConfig structure.
   * Example: `{ proxyRules: 'http=myproxy.com:8080;https=myproxy.com:8080', proxyBypassRules: 'localhost' }`
   *
   * @throws {Error} Throws an error if the provided window (`win`) is invalid (null, destroyed, or missing webContents).
   *
   * @returns {void}
   */
  setProxy(config) {
    this.#checkDestroy();
    return this.#setProxy(this.#win, config);
  }

  /**
   * Returns the internal BrowserWindow instance.
   * @returns {BrowserWindow}
   * @throws {Error} If the window is not initialized.
   */
  getWin() {
    if (!this.#win)
      throw new Error(
        '[getWindow Error] The BrowserWindow instance is not available. Make sure it was properly created.',
      );
    this.#checkDestroy();
    return this.#win;
  }

  /**
   * Toggles the visibility of the window, or sets it explicitly if a value is provided.
   *
   * Emits the `ShowApp` event to the root instance when visibility changes.
   *
   * @param {boolean} [isVisible] - If defined, sets visibility to this value. Otherwise, it toggles.
   * @returns {boolean} - The new visibility state.
   * @throws {Error} If `isVisible` is not a boolean or undefined.
   */
  toggleVisible(isVisible) {
    this.#checkDestroy();
    if (typeof isVisible !== 'undefined' && typeof isVisible !== 'boolean')
      throw new Error(
        `[toggleVisible Error] Expected a boolean or undefined, but got: ${typeof isVisible}`,
      );

    if (!this.#ready) return this.#visible;
    const changeVisibleTo = typeof isVisible === 'boolean' ? isVisible : !this.#visible;

    if (changeVisibleTo) this.#win?.show();
    else this.#win?.hide();
    this.#visible = changeVisibleTo;
    if (this.#win && this.#win.webContents)
      this.#win.webContents.send(this.#AppEvents.ShowApp, changeVisibleTo);
    this.#emit(RootEvents.ShowApp, this.#index, changeVisibleTo);
    return changeVisibleTo;
  }

  /**
   * Sends a ping event with custom data to the renderer process.
   *
   * This method allows the main process to send arbitrary data to the window
   * via the `Ping` event. It is commonly used for connection checks,
   * heartbeat signals, or simple data synchronization.
   *
   * @param {any} data - Any serializable data to send along with the ping event.
   *
   * @throws {Error} Throws an error if the window instance is destroyed or unavailable.
   *
   * @returns {void}
   */
  ping(data) {
    this.#checkDestroy();
    if (this.#win.webContents) this.#win.webContents.send(this.#AppEvents.Ping, data);
  }

  /**
   * Checks whether the given IPC event originated from this window instance.
   *
   * This is useful when multiple windows exist and you want to ensure an IPC event
   * came from the correct one before handling it.
   *
   * @param {Electron.IpcMainEvent} event - The IPC event object received in the main process.
   * @returns {boolean} - Returns true if the event originated from this instance's window.
   */
  isFromWin(event) {
    this.#checkDestroy();
    const webContents = event.sender;
    if (!event.senderFrame) return false;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win && win.id === this.#win.id) return true;
    return false;
  }

  /**
   * @param {Object} [settings2={}] - Configuration for the new instance.
   * @param {Emit} [settings2.emit] - The root controller or application class managing this instance.
   * @param {SetProxy} [settings2.setProxy] - SetProxy callback.
   * @param {OpenDevTools} [settings2.openDevTools] - OpenDevTools callback.
   * @param {LoadPath} [settings2.loadPath] - Load path callback.
   * @param {AppEvents} [settings2.eventNames=this.#AppEvents] - Set of event names for internal messaging.
   * @param {Object} [settings={}] - Configuration for the new BrowserWindow.
   * @param {Electron.BrowserWindowConstructorOptions} [settings.config] - Configuration for the new BrowserWindow.
   * @param {string|number} [settings.index] - (Optional) Index of the window in the manager.
   * @param {boolean} [settings.isMaximized=false] - The window will try to be maximized by booting.
   * @param {boolean} [settings.openWithBrowser=true] - if you will make all links open with the browser, not with the application.
   * @param {boolean} [settings.show] - The window will appear when the load is finished.
   * @param {string[]} [settings.urls=['https:', 'http:']] - List of allowed URL protocols to permit external opening.
   * @throws {Error} If any parameter is invalid.
   */
  constructor(
    { eventNames = this.#AppEvents, emit, loadPath, openDevTools, setProxy } = {},
    {
      config,
      index,
      show,
      isMaximized = false,
      openWithBrowser = true,
      urls = ['https:', 'http:'],
    } = {},
  ) {
    checkEventsList(eventNames, this.#AppEvents);
    if (typeof emit !== 'function')
      throw new Error(`[Window Creation Error] 'emit' must be a event emit.`);
    if (typeof loadPath !== 'function')
      throw new Error(`[Window Creation Error] 'loadPath' must be a loadPath.`);
    if (typeof openDevTools !== 'function')
      throw new Error(`[Window Creation Error] 'openDevTools' must be a openDevTools.`);
    if (typeof setProxy !== 'function')
      throw new Error(`[Window Creation Error] 'setProxy' must be a setProxy.`);

    if (!isJsonObject(config))
      throw new Error('[Window Creation Error] Expected "config" to be an object.');

    if (typeof isMaximized !== 'boolean')
      throw new Error('[Window Creation Error] Expected "isMaximized" to be an boolean.');
    if (typeof openWithBrowser !== 'boolean')
      throw new Error('[Window Creation Error] Expected "openWithBrowser" to be an boolean.');
    if (typeof show !== 'boolean')
      throw new Error('[Window Creation Error] Expected "show" to be an boolean.');

    if (!Array.isArray(urls))
      throw new Error('[Window Creation Error] Expected an url list of strings.');
    for (const item of urls)
      if (typeof item !== 'string')
        throw new Error('[Window Creation Error] All urls in the array must be strings.');

    if (
      typeof index !== 'undefined' &&
      typeof index !== 'string' &&
      (typeof index !== 'number' || !Number.isFinite(index) || Number.isNaN(index))
    )
      throw new Error('[Window Creation Error] Expected "index" to be an string or number.');

    this.#win = new BrowserWindow(config);
    this.#emit = emit;
    this.#openDevTools = openDevTools;
    this.#setProxy = setProxy;
    this.#loadPath = loadPath;
    this.#index = typeof index === 'number' || typeof index === 'string' ? index : null;
    this.#visible = show;

    // Make all links open with the browser, not with the application
    if (openWithBrowser)
      this.#win.webContents.setWindowOpenHandler(({ url }) => {
        let allowed = false;
        for (const name of urls) {
          if (url.startsWith(name)) {
            allowed = true;
            break;
          }
        }
        if (allowed) shell.openExternal(url);
        return { action: 'deny' };
      });

    // Show Page
    this.#win.once('ready-to-show', (...args) => {
      this.#ready = true;
      this.toggleVisible(show);
      if (isMaximized && show) this.#win.maximize();
      this.#emit(RootEvents.ReadyToShow, this.#index, ...args);
    });

    // Resize
    const resizeWindowEvent = () => {
      if (this.#win) this.#win.webContents.send('resize', this.#win.getSize());
    };

    this.#win.on('resize', resizeWindowEvent);
    this.#win.on('resized', resizeWindowEvent);
    this.#win.on('will-resize', resizeWindowEvent);

    this.#win.on('maximize', resizeWindowEvent);
    this.#win.on('unmaximize', resizeWindowEvent);

    this.#win.on('minimize', resizeWindowEvent);
    this.#win.on('restore', resizeWindowEvent);

    this.#win.on('enter-full-screen', resizeWindowEvent);
    this.#win.on('leave-full-screen', resizeWindowEvent);

    this.#win.on('enter-html-full-screen', resizeWindowEvent);
    this.#win.on('leave-html-full-screen', resizeWindowEvent);

    // More
    this.#win.on('focus', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsFocused, true);
    });

    this.#win.on('blur', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsFocused, false);
    });

    this.#win.on('show', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsVisible, true);
    });

    this.#win.on('hide', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsVisible, false);
    });

    this.#win.on('maximize', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsMaximized, true);
    });

    this.#win.on('unmaximize', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsMaximized, false);
    });

    this.#win.on('will-resize', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsMaximized, this.#win.isMaximized());
    });

    this.#win.on('resize', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsMaximized, this.#win.isMaximized());
    });

    this.#win.on('resized', () => {
      if (this.#win && this.#win.webContents)
        this.#win.webContents.send(this.#AppEvents.WindowIsMaximized, this.#win.isMaximized());
    });
  }

  /**
   * Checks whether the internal BrowserWindow instance has been destroyed.
   *
   * This method safely verifies if the window no longer exists or has already been destroyed.
   * It handles edge cases where the window may be `null` or the `isDestroyed` method is unavailable.
   *
   * @returns {boolean} `true` if the window is destroyed or unavailable, otherwise `false`.
   */
  isDestroyed() {
    if (!this.#win || this.#win.isDestroyed()) return true;
    return false;
  }

  /**
   * Destroys the current BrowserWindow instance.
   *
   * @returns {void}
   */
  destroy() {
    if (!this.isDestroyed()) this.#win.destroy();
  }
}

export default TinyWinInstance;
