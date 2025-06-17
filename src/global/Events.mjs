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

/**
 * A map of event names used with an internal EventEmitter instance.
 * These events are emitted and listened to internally within the application to handle
 * lifecycle events, window state changes, and proxy configurations.
 *
 * @typedef {Object} RootEvents
 * @property {string} AppShow            - Emitted when the application is brought to the foreground or made visible.
 * @property {string} IsMaximized        - Emitted when a check is performed or a change occurs in the window's maximized state.
 * @property {string} IsFocused          - Emitted when the window gains or loses focus.
 * @property {string} IsVisible          - Emitted when the window becomes visible or hidden.
 * @property {string} SetProxyError      - Emitted when there is an error setting a proxy configuration.
 * @property {string} SetProxy           - Emitted when a proxy configuration is successfully applied.
 * @property {string} Resize             - Emitted when the application window is resized.
 * @property {string} Ready              - Emitted when the application is ready to initialize its core systems.
 * @property {string} CreateFirstWindow  - Emitted to signal the creation of the first application window.
 * @property {string} ReadyToShow        - Emitted when the window is fully initialized and ready to be displayed, but not yet shown.
 * @property {string} ShowApp            - Emitted when the window is actually shown to the user, following the 'ReadyToShow' event.
 */

export const RootEvents = {
  AppShow: 'AppShow',
  IsMaximized: 'isMaximized',
  IsFocused: 'isFocused',
  IsVisible: 'isVisible',
  SetProxyError: 'setProxyError',
  SetProxy: 'setProxy',
  Resize: 'resize',
  Ready: 'Ready',
  CreateFirstWindow: 'CreateFirstWindow',
  ReadyToShow: 'ReadyToShow',
  ShowApp: 'ShowApp',
};

/**
 * @typedef {Object} NotificationEvents
 * @property {string} Create - Event triggered when a new notification is created.
 * @property {string} Show - Event triggered when a notification is shown to the user.
 * @property {string} All - Event triggered for any notification-related activity.
 * @property {string} Click - Event triggered when the user clicks on a notification.
 * @property {string} Reply - Event triggered when the user replies to a notification (if supported).
 * @property {string} Action - Event triggered when the user interacts with an action button in the notification.
 * @property {string} Failed - Event triggered when showing or creating a notification fails.
 * @property {string} Close - Event triggered when a notification is closed or dismissed.
 */

export const NotificationEvents = {
  Create: 'tiny-notification-create',
  Show: 'tiny-notification-show',
  All: 'tiny-notification-all',
  Click: 'tiny-notification-click',
  Reply: 'tiny-notification-reply',
  Action: 'tiny-notification-action',
  Failed: 'tiny-notification-failed',
  Close: 'tiny-notification-close',
};
