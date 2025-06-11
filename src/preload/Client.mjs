import { EventEmitter } from 'events';
import { ipcRenderer, contextBridge } from 'electron';
import { AppEvents } from '../global/Events.mjs';
import TinyIpcRequestManager from './IpcRequestManager.mjs';

class TinyElectronClient {
  #AppEvents = AppEvents;

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

  #visible = false;
  #focused = false;
  #maximized = false;

  #appShow = true;
  #pinged = false;

  data = {};
  cache = {};

  /** @param {Record<string,*>} data */
  _firstPing(data) {
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

  installWinScript() {
    contextBridge.exposeInMainWorld(
      'changeTrayIcon',
      /** @param {string} img */ (img) => {
        if (typeof img !== 'string')
          throw new Error('[changeTrayIcon] The img needs to be a string.');
        ipcRenderer.send(this.#AppEvents.ChangeTrayIcon, img, 'main');
      },
    );

    contextBridge.exposeInMainWorld(
      'changeAppIcon',
      /** @param {string} img */ (img) => {
        if (typeof img !== 'string')
          throw new Error('[changeAppIcon] The img needs to be a string.');
        ipcRenderer.send(this.#AppEvents.ChangeAppIcon, img);
      },
    );
  }

  /**
   * @param {Object} [settings={}] - Configuration settings for the application.
   * @param {string} [settings.ipcReceiverChannel] - Custom ipc response channel name of TinyIpcResponder instance.
   *
   * @throws {Error} If any required string values are missing or invalid.
   */
  constructor({ ipcReceiverChannel } = {}) {
    this.#ipcRequest = new TinyIpcRequestManager(ipcReceiverChannel);

    ipcRenderer.on('resize', (event, data) => this.#emit('resize', data));
    ipcRenderer.on('set-proxy', (event, data) => this.#emit('setProxy', data));
    ipcRenderer.on('console-message', (event, msg, msg2) => console.log(msg, msg2));

    ipcRenderer.on('set-proxy-error', (event, data) => {
      try {
        /** @type {Error} */
        const err = new Error(data.message);
        err.code = data.code;
        err.message = data.message;
        err.cause = data.cause;
        err.stack = data.stack;
        this.#emit('setProxyError', err);
      } catch (err) {
        console.error(err);
      }
    });

    // App Status
    ipcRenderer.on('tiny-app-is-show', (event, data) => {
      this.#setShowStatus(data);
      this.#emit('appShow', data);
    });

    ipcRenderer.on('window-is-maximized', (_event, arg) => {
      this.#setIsMaximized(arg);
      this.#emit('isMaximized', arg);
    });

    ipcRenderer.on('window-is-focused', (_event, arg) => {
      this.#setIsFocused(arg);
      this.#emit('isFocused', arg);
    });

    ipcRenderer.on('window-is-visible', (_event, arg) => {
      this.#setIsVisible(arg);
      this.#emit('isVisible', arg);
    });

    ipcRenderer.on('ping', (_event, arg) => this._firstPing(arg));
    ipcRenderer.on('electron-cache-values', (event, msg) => this.#setCache(msg));
  }
}

export default TinyElectronClient;
