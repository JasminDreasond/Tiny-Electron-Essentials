/**
 * A map of internal IPC event names used throughout the application to trigger various
 * window and system-level actions. These strings are used as channel names for communication
 * between the main and renderer processes in an Electron-based application. This map ensures
 * that IPC communication is standardized and centralized to avoid naming inconsistencies.
 *
 * @typedef {Object} AppEvents
 * @property {string} OpenDevTools        - Opens the developer tools in the application window.
 * @property {string} SetTitle            - Sets the title of the application window.
 * @property {string} FocusWindow         - Brings the application window to the foreground.
 * @property {string} BlurWindow          - Removes focus from the application window.
 * @property {string} ShowWindow          - Makes the application window visible if hidden.
 * @property {string} ForceFocusWindow    - Forces the application window to gain focus, even if not focused normally.
 * @property {string} SystemIdleTime      - Requests the amount of time (in ms) the system has been idle.
 * @property {string} SystemIdleState     - Requests the current idle state of the system (active, idle, locked, etc.).
 * @property {string} ToggleVisible       - Toggles visibility of the application window.
 * @property {string} AppQuit             - Quits the application gracefully.
 * @property {string} SetProxy            - Sets a custom network proxy for the application.
 * @property {string} SetProxyError       - Triggered when setting the proxy fails.
 * @property {string} WindowIsMaximized   - Asks whether the window is currently maximized.
 * @property {string} WindowMaximize      - Maximizes the application window.
 * @property {string} WindowUnmaximize    - Restores the window from maximized to normal size.
 * @property {string} WindowMinimize      - Minimizes the application window to the taskbar or dock.
 * @property {string} WindowIsFocused     - Returns whether the application window is currently focused.
 * @property {string} WindowIsVisible     - Returns whether the application window is currently visible.
 * @property {string} WindowHide          - Hides the application window from view.
 * @property {string} WindowShow          - Shows the application window if hidden.
 * @property {string} ChangeAppIcon       - Changes the icon of the application window.
 * @property {string} ChangeTrayIcon      - Changes the system tray icon of the application.
 * @property {string} ConsoleMessage      - Sends a message to be printed in the window process console.
 * @property {string} ElectronCacheValues - Requests or responds with cached Electron-related values (e.g., user agent, version).
 * @property {string} Ping                - Used to check connectivity between processes or confirm IPC channel activity.
 * @property {string} Resize              - Resizes the application window to a specified width and height.
 * @property {string} ShowApp             - Instructs the application to become visible, typically restoring it from the tray.
 */

export const AppEvents = {
  OpenDevTools: 'open-devtools',
  SetTitle: 'set-title',
  FocusWindow: 'tiny-focus-window',
  BlurWindow: 'tiny-blur-window',
  ShowWindow: 'tiny-show-window',
  ForceFocusWindow: 'tiny-force-focus-window',
  SystemIdleTime: 'system-idle-time',
  SystemIdleState: 'system-idle-state',
  ToggleVisible: 'toggle-visible',
  AppQuit: 'app-quit',
  SetProxy: 'set-proxy',
  SetProxyError: 'set-proxy-error',
  WindowIsMaximized: 'window-is-maximized',
  WindowMaximize: 'window-maximize',
  WindowUnmaximize: 'window-unmaximize',
  WindowMinimize: 'window-minimize',
  WindowIsFocused: 'window-is-focused',
  WindowIsVisible: 'window-is-visible',
  WindowHide: 'window-hide',
  WindowShow: 'window-show',
  ChangeAppIcon: 'change-app-icon',
  ChangeTrayIcon: 'change-tray-icon',
  ConsoleMessage: 'console-message',
  ElectronCacheValues: 'electron-cache-values',
  Ping: 'ping',
  Resize: 'resize',
  ShowApp: 'tiny-app-is-show',
};
