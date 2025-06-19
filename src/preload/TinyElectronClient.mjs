import { EventEmitter } from 'events';
import { ipcRenderer, contextBridge } from 'electron';
import { isJsonObject } from 'tiny-essentials';
import { AppEvents, RootEvents } from '../global/Events.mjs';
import { checkEventsList, deserializeError } from '../global/Utils.mjs';
import TinyIpcRequestManager from './TinyIpcRequestManager.mjs';
import { getLoadingHtml } from './LoadingHtml.mjs';

/**
 * Represents the result of installing a loading page, providing methods
 * to control its insertion and removal from the DOM.
 *
 * @typedef {Object} InstallLoadingPageResult
 * @property {() => void} appendLoading - Appends the loading screen elements to the document.
 * @property {() => void} removeLoading - Removes the loading screen elements from the document.
 */

/**
 * Represents the client-side API exposed by the Electron preload script,
 * enabling secure and controlled communication between the page and preload process.
 *
 * @typedef {Object} TinyElectronClientApi
 *
 * Registers a listener for the specified event.
 * @property {(event: string | symbol, listener: ListenerCallback) => void} on
 *
 * Removes a listener from the specified event.
 * @property {(event: string | symbol, listener: ListenerCallback) => void} off
 *
 * Registers a one-time listener for the specified event.
 * @property {(event: string | symbol, listener: ListenerCallback) => void} once
 *
 * Opens the Developer Tools (DevTools) for the window.
 * @property {(ops: Electron.OpenDevToolsOptions) => void} openDevTools
 *
 * Sets the window title for the BrowserWindow.
 * @property {(title: string) => void} setTitle
 *
 * Retrieves the current internal visibility status flag.
 * May differ from actual visibility (`isVisible`) for internal tracking purposes.
 * @property {() => boolean} getShowStatus
 *
 * Returns an object containing runtime data about the current session or app instance.
 * This data is typically provided by the main process.
 * @property {() => Record<string, any>} getData
 *
 * Indicates whether the application window is currently visible on the screen.
 * @property {() => boolean} isVisible
 *
 * Indicates whether the application window is currently focused.
 * @property {() => boolean} isFocused
 *
 * Indicates whether the application window is currently maximized.
 * @property {() => boolean} isMaximized
 *
 * Returns a key-value object representing cached state/data stored by the main process.
 * @property {() => Record<string, any>} getCache
 *
 * Sends a request to the main process to update and resend the latest cache state.
 * @property {() => Promise<Record<string, *>>} requestCache
 *
 * Sends a request to forcibly focus the application window, even if it’s not currently visible or active.
 * @property {() => Promise<void>} forceFocus
 *
 * Brings the application window to the front and gives it focus.
 * @property {() => Promise<void>} focus
 *
 * Removes focus from the application window, if currently focused.
 * @property {() => Promise<void>} blur
 *
 * Makes the application window visible.
 * @property {() => Promise<void>} show
 *
 * Hides the application window from view (but does not quit the app).
 * @property {() => Promise<void>} hide
 *
 * Closes the application window (but does not quit the app).
 * @property {() => Promise<void>} close
 *
 * Destroy the application window (but does not quit the app).
 * @property {() => Promise<void>} destroy
 *
 * Maximizes the application window to fill the screen.
 * @property {() => Promise<void>} maximize
 *
 * Restores the application window from maximized state to its previous size.
 * @property {() => Promise<void>} unmaximize
 *
 * Minimizes the application window to the taskbar/dock.
 * @property {() => Promise<void>} minimize
 *
 * Requests the application to quit immediately.
 * @property {() => void} quit
 *
 * Retrieves the amount of system idle time in seconds.
 * @property {() => Promise<number>} systemIdleTime
 *
 * Determines the current system idle state.
 * @property {(idleThreshold: number) => Promise<"active" | "idle" | "locked" | "unknown">} systemIdleState
 *
 * Returns the absolute path to the current executable of the running application.
 * @property {() => string} getExecPath
 *
 * Changes the tray icon to the specified image.
 * `img` should be a valid image file.
 * @property {(img: string, id: string) => Promise<void>} changeTrayIcon
 *
 * Changes the application window or dock icon (depending on platform).
 * `img` should be a valid image file.
 * @property {(img: string) => Promise<void>} changeAppIcon
 *
 * Sets the internal visibility flag.
 * @property {(isVisible?: boolean) => Promise<boolean>} setIsVisible
 *
 * Updates the application's network proxy settings.
 * Requires an Electron `ProxyConfig` object with appropriate options.
 * @property {(config: Electron.ProxyConfig) => Promise<void>} setProxy
 */

class TinyElectronClient {
  /** @typedef {import('./LoadingHtml.mjs').GetLoadingHtml} GetLoadingHtml */

  #AppEvents = AppEvents;
  #exposeInMainWorld = '';

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

  /** @type {TinyIpcRequestManager} */
  #ipcRequest;

  #fullscreen = false;
  #visible = false;
  #focused = false;
  #maximized = false;

  #appShow = true;
  #pinged = false;

  /** @type {Record<string, number>} */
  #eventPings = {};

  /** @type {Record<string, any>} */
  data = {};

  /** @type {Record<string, any>} */
  cache = {};

  /** @param {Record<string,*>} data */
  #firstPing(data) {
    this.#pinged = true;
    this.data = data;
  }

  /** @param {Record<string,*>} value */
  #setCache(value) {
    this.cache = value;
  }

  /** @param {boolean} value */
  #setIsVisible(value) {
    this.#visible = value;
  }

  /** @param {boolean} value */
  #setIsFullScreen(value) {
    this.#fullscreen = value;
  }

  /** @param {boolean} value */
  #setIsFocused(value) {
    this.#focused = value;
  }

  /** @param {boolean} value */
  #setShowStatus(value) {
    this.#appShow = value;
  }

  /** @param {boolean} value */
  #setIsMaximized(value) {
    this.#maximized = value;
  }

  /** @returns {Record<string,*>} */
  getCache() {
    return this.cache;
  }

  /** @returns {Record<string,*>} */
  getData() {
    return this.data;
  }

  /** @returns {boolean} */
  getShowStatus() {
    return this.#appShow;
  }

  /** @returns {boolean} */
  isFullScreen() {
    return this.#fullscreen;
  }

  /** @returns {boolean} */
  isPinged() {
    return this.#pinged;
  }

  /** @returns {boolean} */
  isFocused() {
    return this.#focused;
  }

  /** @returns {boolean} */
  isVisible() {
    return this.#visible;
  }

  /** @returns {boolean} */
  isMaximized() {
    return this.#maximized;
  }

  /**
   * Returns the internal TinyIpcRequestManager instance.
   * @returns {TinyIpcRequestManager}
   */
  getIpcRequest() {
    return this.#ipcRequest;
  }

  /**
   * Retrieves the amount of system idle time in seconds.
   * This represents how long the system has been idle (i.e., without any user input).
   *
   * @returns {Promise<number>} A promise that resolves with the number of seconds since last user activity.
   */
  systemIdleTime() {
    return this.#ipcRequest.send(this.#AppEvents.SystemIdleTime);
  }

  /**
   * Determines the current system idle state.
   *
   * @param {number} idleThreshold
   *
   * @returns {Promise<"active" | "idle" | "locked" | "unknown">}
   */
  systemIdleState(idleThreshold) {
    return this.#ipcRequest.send(this.#AppEvents.SystemIdleState, idleThreshold);
  }

  /**
   * Sends a request to the main process to update and resend the latest cache state.
   * @returns {Promise<Record<string, *>>}
   */
  async requestCache() {
    const result = await this.#ipcRequest.send(this.#AppEvents.ElectronCacheValues);
    this.#setCache(result);
    return result;
  }

  /**
   * Sends a request to forcibly focus the application window, even if it’s not currently visible or active.
   * @returns {Promise<void>}
   */
  forceFocus() {
    return this.#ipcRequest.send(this.#AppEvents.ForceFocusWindow);
  }

  /**
   * Brings the application window to the front and gives it focus.
   * @returns {Promise<void>}
   */
  focus() {
    return this.#ipcRequest.send(this.#AppEvents.FocusWindow);
  }

  /**
   * Removes focus from the application window, if currently focused.
   * @returns {Promise<void>}
   */
  blur() {
    return this.#ipcRequest.send(this.#AppEvents.BlurWindow);
  }

  /**
   * Makes the application window visible.
   * @returns {Promise<void>}
   */
  show() {
    return this.#ipcRequest.send(this.#AppEvents.ShowWindow);
  }

  /**
   * Hides the application window from view (but does not quit the app).
   * @returns {Promise<void>}
   */
  hide() {
    return this.#ipcRequest.send(this.#AppEvents.WindowHide);
  }

  /**
   * Closes the application window (but does not quit the app).
   * @returns {Promise<void>}
   */
  close() {
    return this.#ipcRequest.send(this.#AppEvents.WindowClose);
  }

  /**
   * Destroy the application window (but does not quit the app).
   * @returns {Promise<void>}
   */
  destroy() {
    return this.#ipcRequest.send(this.#AppEvents.WindowDestroy);
  }

  /**
   * Maximizes the application window to fill the screen.
   * @returns {Promise<void>}
   */
  maximize() {
    return this.#ipcRequest.send(this.#AppEvents.WindowMaximize);
  }

  /**
   * Restores the application window from maximized state to its previous size.
   * @returns {Promise<void>}
   */
  unmaximize() {
    return this.#ipcRequest.send(this.#AppEvents.WindowUnmaximize);
  }

  /**
   * Minimizes the application window to the taskbar/dock.
   * @returns {Promise<void>}
   */
  minimize() {
    return this.#ipcRequest.send(this.#AppEvents.WindowMinimize);
  }

  /**
   * Requests the application to quit immediately.
   *
   * @returns {void}
   */
  quit() {
    return ipcRenderer.send(this.#AppEvents.AppQuit, true);
  }

  /**
   * Returns the absolute path to the current executable of the running application.
   *
   * @returns {string}
   */
  getExecPath() {
    return process.execPath;
  }

  /**
   * Sets the internal visibility flag.
   *
   * @param {boolean} [isVisible]
   * @returns {Promise<boolean>}
   */
  setIsVisible(isVisible) {
    return this.#ipcRequest.send(this.#AppEvents.ToggleVisible, isVisible);
  }

  /**
   * Updates the application's network proxy settings.
   * Requires an Electron `ProxyConfig` object with appropriate options.
   *
   * @param {Electron.ProxyConfig} config
   * @returns {Promise<void>}
   */
  setProxy(config) {
    return this.#ipcRequest.send(this.#AppEvents.SetProxy, config);
  }

  /**
   * Changes the tray icon to the specified image.
   * `img` should be a valid image file.
   *
   * @param {string} img
   * @param {string} id
   *
   * @returns {Promise<void>}
   */
  changeTrayIcon(img, id) {
    if (typeof img !== 'string')
      throw new TypeError('[changeTrayIcon] The img needs to be a string.');
    if (typeof id !== 'string')
      throw new TypeError('[changeTrayIcon] The id needs to be a string.');
    return this.#ipcRequest.send(this.#AppEvents.ChangeTrayIcon, { img, id });
  }

  /**
   * Changes the application window or dock icon (depending on platform).
   *
   * @param {string} img
   * @returns {Promise<void>}
   */
  changeAppIcon(img) {
    if (typeof img !== 'string')
      throw new TypeError('[changeAppIcon] The img needs to be a string.');
    return this.#ipcRequest.send(this.#AppEvents.ChangeAppIcon, img);
  }

  /**
   * Opens the Developer Tools (DevTools) for the window.
   *
   * This method triggers the main process to open the DevTools panel
   * with optional configuration.
   *
   * @param {Electron.OpenDevToolsOptions} [ops] - Optional settings to customize the behavior of DevTools.
   * Example options include `{ mode: 'undocked' }` or `{ mode: 'detach' }`.
   *
   * @returns {Promise<void>} A promise that resolves when the request is successfully sent.
   */
  openDevTools(ops) {
    return this.#ipcRequest.send(this.#AppEvents.OpenDevTools, ops);
  }

  /**
   * Sets the window title for the BrowserWindow.
   *
   * This method sends an IPC request to the main process to update the
   * window's title dynamically.
   *
   * @param {string} title - The new title to set. Must be a non-empty string.
   *
   * @throws {TypeError} If the title is not a string.
   *
   * @returns {Promise<void>} A promise that resolves when the title is set.
   */
  setTitle(title) {
    return this.#ipcRequest.send(this.#AppEvents.SetTitle, title);
  }

  /**
   * @param {string} apiName - The name under which the API will be exposed in the window context.
   * @param {string[]} [enabledMethods] - Optional list of method names to include in the API. All methods are enabled by default.
   * @returns {Partial<TinyElectronClientApi>}
   */
  installWinScript(apiName = 'electronWindow', enabledMethods) {
    if (this.#exposeInMainWorld.length > 0)
      throw new Error(
        `[installWinScript] API '${this.#exposeInMainWorld}' is already exposed in the main world.`,
      );
    if (typeof apiName !== 'string' || apiName.length < 1)
      throw new Error('[installWinScript] apiName must be a non-empty string.');
    this.#exposeInMainWorld = apiName;

    /** @type {TinyElectronClientApi} */
    const apiTemplate = {
      on: (event, listener) => {
        this.on(event, listener);
      },
      off: (event, listener) => {
        this.on(event, listener);
      },
      once: (event, listener) => {
        this.once(event, listener);
      },
      openDevTools: (ops) => this.openDevTools(ops),
      setTitle: (title) => this.setTitle(title),

      getShowStatus: () => this.getShowStatus(),
      getData: () => this.getData(),
      getCache: () => this.getCache(),

      isVisible: () => this.isVisible(),
      isFocused: () => this.isFocused(),
      isMaximized: () => this.isMaximized(),

      requestCache: () => this.requestCache(),

      forceFocus: () => this.forceFocus(),
      focus: () => this.focus(),
      blur: () => this.blur(),

      show: () => this.show(),
      hide: () => this.hide(),
      close: () => this.close(),
      destroy: () => this.destroy(),

      maximize: () => this.maximize(),
      unmaximize: () => this.unmaximize(),
      minimize: () => this.minimize(),
      quit: () => this.quit(),

      systemIdleTime: () => this.systemIdleTime(),
      systemIdleState: (idleThreshold) => this.systemIdleState(idleThreshold),

      getExecPath: () => this.getExecPath(),

      changeTrayIcon: (img, id) => this.changeTrayIcon(img, id),
      changeAppIcon: (img) => this.changeAppIcon(img),

      setIsVisible: (isVisible) => this.setIsVisible(isVisible),

      setProxy: (config) => this.setProxy(config),
    };

    /** @type {Partial<TinyElectronClientApi>} */
    const api = {};

    if (!Array.isArray(enabledMethods)) {
      for (const name in apiTemplate) {
        // @ts-ignore
        api[name] = apiTemplate[name];
      }
    } else {
      for (const name of enabledMethods) {
        if (typeof name !== 'string')
          throw new TypeError(
            `[installWinScript] All values in enabledMethods must be strings. Found: ${typeof name}`,
          );

        // @ts-ignore
        if (typeof apiTemplate[name] === 'function') {
          // @ts-ignore
          api[name] = apiTemplate[name];
        } else {
          throw new Error(`[installWinScript] Invalid method name: "${name}"`);
        }
      }
    }

    contextBridge.exposeInMainWorld(apiName, api);
    return api;
  }

  /**
   * Installs a loading page and exposes methods to control it via the main world context.
   *
   * @param {string} [exposeInMainWorld='useLoadingElectron'] - The name of the property exposed in the window object via Electron’s `contextBridge`.
   * @param {GetLoadingHtml} [config] - Optional configuration for the loading screen, including custom HTML and CSS.
   * @returns {InstallLoadingPageResult} Object containing `appendLoading` and `removeLoading` methods.
   *
   * @throws {TypeError} If `exposeInMainWorld` is provided but is not a string.
   */
  installLoadingPage(exposeInMainWorld = 'useLoadingElectron', config) {
    if (typeof exposeInMainWorld !== 'undefined' && typeof exposeInMainWorld !== 'string')
      throw new TypeError(
        `Invalid key type "${typeof exposeInMainWorld}" of exposeInMainWorld. Only string keys are supported.`,
      );

    /**
     * Resolves when the DOM has reached a ready state included in the given list.
     *
     * @param {DocumentReadyState[]} [condition=['complete', 'interactive']] - List of acceptable document states to consider the DOM ready.
     * @returns {Promise<boolean>} Promise that resolves when DOM is ready.
     */
    function domReady(condition = ['complete', 'interactive']) {
      return new Promise((resolve) => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        } else {
          document.addEventListener('readystatechange', () => {
            if (condition.includes(document.readyState)) {
              resolve(true);
            }
          });
        }
      });
    }

    /**
     * Utility object that provides safe methods for appending and removing
     * child elements from a parent, avoiding duplication or errors.
     */
    const safeDOM = {
      /**
       * Appends a child element to a parent if it is not already present.
       *
       * @param {HTMLElement} parent - The parent element to append to.
       * @param {HTMLElement} child - The child element to append.
       */
      append(parent, child) {
        if (!Array.from(parent.children).find((e) => e === child)) {
          return parent.appendChild(child);
        }
      },
      /**
       * Removes a child element from a parent if it exists.
       *
       * @param {HTMLElement} parent - The parent element to remove from.
       * @param {HTMLElement} child - The child element to remove.
       */
      remove(parent, child) {
        if (Array.from(parent.children).find((e) => e === child)) {
          return parent.removeChild(child);
        }
      },
    };

    /**
     * Initializes the loading screen and provides control methods for it.
     *
     * @returns {InstallLoadingPageResult} Object with methods to append or remove the loading screen.
     */
    function useLoading() {
      const { oStyle, oDiv } = getLoadingHtml(config);
      /** @type {InstallLoadingPageResult} */
      return {
        appendLoading() {
          safeDOM.append(document.head, oStyle);
          safeDOM.append(document.body, oDiv);
        },
        removeLoading() {
          safeDOM.remove(document.head, oStyle);
          safeDOM.remove(document.body, oDiv);
        },
      };
    }

    // ----------------------------------------------------------------------

    const { appendLoading, removeLoading } = useLoading();
    if (typeof exposeInMainWorld === 'string')
      contextBridge.exposeInMainWorld(exposeInMainWorld, { appendLoading, removeLoading });
    domReady().then(appendLoading);

    window.onmessage = (ev) => {
      ev.data.payload === 'removeLoading' && removeLoading();
    };

    return { appendLoading, removeLoading };
  }

  /**
   * @param {Object} [settings={}] - Configuration settings for the application.
   * @param {string} [settings.ipcReceiverChannel] - Custom ipc response channel name of TinyIpcResponder instance.
   * @param {AppEvents} [settings.eventNames=this.#AppEvents] - Set of event names for internal messaging.
   *
   * @throws {Error} If any required string values are missing or invalid.
   */
  constructor({ ipcReceiverChannel, eventNames = { ...this.#AppEvents } } = {}) {
    checkEventsList(eventNames, this.#AppEvents);
    this.#ipcRequest = new TinyIpcRequestManager(ipcReceiverChannel);

    // Console warning
    ipcRenderer.on(this.#AppEvents.ConsoleMessage, (_event, { value } = {}) =>
      console.log(value[0], value[1]),
    );

    /**
     * @param {string} where
     * @param {((value: any) => void)|null} callback
     * @param {{ value: any; time: number; }} data
     */
    const sendEvent = (where, callback, data) => {
      const { value, time } = data;
      if (typeof this.#eventPings[where] !== 'number') this.#eventPings[where] = 0;
      if (
        typeof time === 'number' &&
        Number.isFinite(time) &&
        !Number.isNaN(time) &&
        time > this.#eventPings[where]
      ) {
        this.#eventPings[where] = time;
        if (typeof callback === 'function') callback(value);
        this.#emit(where, value);
      }
    };

    // Ready to Show
    ipcRenderer.on(this.#AppEvents.ReadyToShow, (_event, data) =>
      sendEvent(RootEvents.ReadyToShow, null, data),
    );

    // Resize
    ipcRenderer.on(this.#AppEvents.Resize, (_event, data) =>
      sendEvent(RootEvents.Resize, null, data),
    );

    // Proxy
    ipcRenderer.on(this.#AppEvents.SetProxy, (_event, data) =>
      sendEvent(RootEvents.SetProxy, null, data),
    );

    ipcRenderer.on(this.#AppEvents.SetProxyError, (_event, { err }) => {
      try {
        /** @type {Error} */
        const newErr = deserializeError(err);
        this.#emit(RootEvents.SetProxyError, newErr);
      } catch (newErr) {
        console.error(newErr);
      }
    });

    // App Status
    ipcRenderer.on(this.#AppEvents.ShowApp, (_event, data) =>
      sendEvent(RootEvents.ShowApp, (value) => this.#setShowStatus(value), data),
    );

    // Maximize
    ipcRenderer.on(this.#AppEvents.WindowIsMaximized, (_event, arg) =>
      sendEvent(RootEvents.IsMaximized, (value) => this.#setIsMaximized(value), arg),
    );

    // Focus
    ipcRenderer.on(this.#AppEvents.WindowIsFocused, (_event, arg) =>
      sendEvent(RootEvents.IsFocused, (value) => this.#setIsFocused(value), arg),
    );

    // Visible
    ipcRenderer.on(this.#AppEvents.WindowIsVisible, (_event, arg) =>
      sendEvent(RootEvents.IsVisible, (value) => this.#setIsVisible(value), arg),
    );

    // Full Screen
    ipcRenderer.on(this.#AppEvents.WindowIsFullScreen, (_event, arg) =>
      sendEvent(RootEvents.IsFullScreen, (value) => this.#setIsFullScreen(value), arg),
    );

    // Ping
    ipcRenderer.on(this.#AppEvents.Ping, (_event, arg) =>
      sendEvent(RootEvents.Ping, (value) => this.#firstPing(value), arg),
    );

    // Ready
    window.addEventListener('DOMContentLoaded', () => {
      this.#emit(RootEvents.Ready);
    });
  }
}

export default TinyElectronClient;
