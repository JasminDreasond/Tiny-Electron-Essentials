import { app, BrowserWindow, shell, ipcMain, Tray, Menu } from 'electron';

/**
 * Represents a single managed Electron BrowserWindow instance.
 *
 * This class tracks visibility, readiness, and index of the window.
 * It allows toggling visibility and storing references to the parent controller and window instance.
 */
class TinyWinInstance {
  /** @typedef {function(string | symbol, ...any): void} Emit */

  /** @type {number|null} */
  #index = null;
  #visible = false;
  #ready = false;

  /**
   * Emits an event with optional arguments.
   * @type {Emit}
   */
  #emit;

  /**
   * Returns the window index assigned to this instance.
   * @returns {number|null}
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
   * Toggles the visibility of the window, or sets it explicitly if a value is provided.
   *
   * Emits the `ShowApp` event to the root instance when visibility changes.
   *
   * @param {boolean} [isVisible] - If defined, sets visibility to this value. Otherwise, it toggles.
   * @returns {boolean} - The new visibility state.
   * @throws {Error} If `isVisible` is not a boolean or undefined.
   */
  toggleVisible(isVisible) {
    if (typeof isVisible !== 'undefined' && typeof isVisible !== 'boolean')
      throw new Error(
        `[toggleVisible Error] Expected a boolean or undefined, but got: ${typeof isVisible}`,
      );

    if (!this.#ready) return this.#visible;
    const changeVisibleTo = typeof isVisible === 'boolean' ? isVisible : !this.#visible;

    if (changeVisibleTo) this.win?.show();
    else this.win?.hide();
    this.#visible = changeVisibleTo;
    this.#emit('ShowApp', this.#index, changeVisibleTo);
    return changeVisibleTo;
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
    const webContents = event.frameId;
    if (!event.senderFrame) return false;
    const win = BrowserWindow.fromId(webContents);
    if (win && win.id === this.win.id) return true;
    return false;
  }

  /**
   * @param {Emit} emit - The root controller or application class managing this instance.
   * @param {Object} [settings={}] - Configuration for the new BrowserWindow.
   * @param {Electron.BrowserWindowConstructorOptions} [settings.config] - Configuration for the new BrowserWindow.
   * @param {boolean} [settings.openWithBrowser=true] - if you will make all links open with the browser, not with the application.
   * @param {number|null} [index=null] - Index of the window in the manager (null for main window).
   * @param {boolean} [isMain=false] - Indicates whether this is the main application window.
   * @throws {Error} If any parameter is invalid.
   */
  constructor(emit, { config, openWithBrowser = true } = {}, index = null, isMain = false) {
    if (typeof emit !== 'function')
      throw new Error(`[Window Creation Error] 'emit' must be a event emit.`);
    if (index !== null && typeof index !== 'number')
      throw new Error(
        `[Window Creation Error] 'index' must be a number or null. Received: ${typeof index}`,
      );
    if (typeof isMain !== 'boolean')
      throw new Error(
        `[Window Creation Error] 'isMain' must be a boolean. Received: ${typeof isMain}`,
      );

    if (typeof config === 'undefined' || typeof config !== 'object' || config === null)
      throw new Error('[Window Creation Error] Expected "config" to be an object if defined.');

    if (typeof openWithBrowser !== 'boolean')
      throw new Error('[Window Creation Error] Expected "openWithBrowser" to be an boolean.');

    this.win = new BrowserWindow(config);
    this.#emit = emit;
    this.#index = index;

    // Make all links open with the browser, not with the application
    if (openWithBrowser)
      this.win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:') || url.startsWith('http:')) shell.openExternal(url);
        return { action: 'deny' };
      });

    // Window status
    ipcMain.on('window-is-maximized', (event) => {
      if (this.win && this.win.webContents && this.isFromWin(event)) {
        this.win.webContents.send('window-is-maximized', this.win.isMaximized());
      }
    });

    ipcMain.on('window-maximize', (event) => {
      if (this.win && this.isFromWin(event)) this.win.maximize();
    });

    ipcMain.on('window-unmaximize', (event) => {
      if (this.win && this.isFromWin(event)) this.win.unmaximize();
    });

    ipcMain.on('window-minimize', (event) => {
      if (this.win && this.isFromWin(event)) this.win.minimize();
    });

    ipcMain.on('window-hide', (event) => {
      if (this.isFromWin(event)) this.toggleVisible(false);
    });

    // Resize
    const resizeWindowEvent = () => {
      if (this.win) this.win.webContents.send('resize', this.win.getSize());
    };

    this.win.on('resize', resizeWindowEvent);
    this.win.on('resized', resizeWindowEvent);
    this.win.on('will-resize', resizeWindowEvent);

    this.win.on('maximize', resizeWindowEvent);
    this.win.on('unmaximize', resizeWindowEvent);

    this.win.on('minimize', resizeWindowEvent);
    this.win.on('restore', resizeWindowEvent);

    this.win.on('enter-full-screen', resizeWindowEvent);
    this.win.on('leave-full-screen', resizeWindowEvent);

    this.win.on('enter-html-full-screen', resizeWindowEvent);
    this.win.on('leave-html-full-screen', resizeWindowEvent);

    // More
    this.win.on('focus', () => {
      if (this.win && this.win.webContents) this.win.webContents.send('window-is-focused', true);
    });

    this.win.on('blur', () => {
      if (this.win && this.win.webContents) this.win.webContents.send('window-is-focused', false);
    });

    this.win.on('show', () => {
      if (this.win && this.win.webContents) this.win.webContents.send('window-is-visible', true);
    });

    this.win.on('hide', () => {
      if (this.win && this.win.webContents) this.win.webContents.send('window-is-visible', false);
    });

    this.win.on('maximize', () => {
      if (this.win && this.win.webContents) this.win.webContents.send('window-is-maximized', true);
    });

    this.win.on('unmaximize', () => {
      if (this.win && this.win.webContents) this.win.webContents.send('window-is-maximized', false);
    });

    this.win.on('will-resize', () => {
      if (this.win && this.win.webContents)
        this.win.webContents.send('window-is-maximized', this.win.isMaximized());
    });

    this.win.on('resize', () => {
      if (this.win && this.win.webContents)
        this.win.webContents.send('window-is-maximized', this.win.isMaximized());
    });

    this.win.on('resized', () => {
      if (this.win && this.win.webContents)
        this.win.webContents.send('window-is-maximized', this.win.isMaximized());
    });
  }
}

export default TinyWinInstance;
