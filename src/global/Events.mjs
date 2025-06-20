/**
 * A map of internal IPC event names used throughout the application to trigger various
 * window and system-level actions. These strings are used as channel names for communication
 * between the main and renderer processes in an Electron-based application. This map ensures
 * that IPC communication is standardized and centralized to avoid naming inconsistencies.
 *
 * @typedef {Object} AppEvents
 * @property {string} OpenDevTools              - Opens the developer tools in the application window.
 * @property {string} SetTitle                  - Sets the title of the application window.
 * @property {string} FocusWindow               - Brings the application window to the foreground.
 * @property {string} BlurWindow                - Removes focus from the application window.
 * @property {string} ShowWindow                - Makes the application window visible if hidden.
 * @property {string} ForceFocusWindow          - Forces the application window to gain focus, even if not focused normally.
 * @property {string} SystemIdleTime            - Requests the amount of time (in ms) the system has been idle.
 * @property {string} SystemIdleState           - Requests the current idle state of the system (active, idle, locked, etc.).
 * @property {string} ToggleVisible             - Toggles visibility of the application window.
 * @property {string} AppQuit                   - Quits the application gracefully.
 * @property {string} SetProxy                  - Sets a custom network proxy for the application.
 * @property {string} SetProxyError             - Triggered when setting the proxy fails.
 * @property {string} WindowIsMaximized         - Asks whether the window is currently maximized.
 * @property {string} WindowMaximize            - Maximizes the application window.
 * @property {string} WindowUnmaximize          - Restores the window from maximized to normal size.
 * @property {string} WindowMinimize            - Minimizes the application window to the taskbar or dock.
 * @property {string} WindowIsFocused           - Returns whether the application window is currently focused.
 * @property {string} WindowIsVisible           - Returns whether the application window is currently visible.
 * @property {string} WindowIsFullScreen        - Returns whether the application window is currently in fullscreen mode.
 * @property {string} ReadyToShow               - Notifies that the window has completed initialization and is ready to be displayed.
 * @property {string} WindowHide                - Hides the application window from view.
 * @property {string} WindowShow                - Shows the application window if hidden.
 * @property {string} WindowClose               - Closes the application window.
 * @property {string} WindowDestroy             - Destroys the application window instance entirely.
 * @property {string} ChangeAppIcon             - Changes the icon of the application window dynamically.
 * @property {string} ChangeTrayIcon            - Changes the system tray icon of the application dynamically.
 * @property {string} ConsoleMessage            - Sends a message to be printed in the renderer process console for debugging purposes.
 * @property {string} ElectronCacheValues       - Requests or responds with cached Electron-related values (e.g., user agent, versions, etc.).
 * @property {string} Ping                      - Sends a ping signal to check the connectivity or liveness of the IPC channel.
 * @property {string} DOMContentLoaded          - Fired when the renderer has loaded the DOM content completely.
 * @property {string} Resize                    - Resizes the application window to the specified width and height.
 * @property {string} ShowApp                   - Brings the entire application to the foreground, typically from the system tray or background.
 * @property {string} WindowIsMaximizable       - Returns whether the application window is currently maximizable.
 * @property {string} WindowIsClosable          - Returns whether the application window is currently closable.
 * @property {string} WindowIsFocusable         - Returns whether the application window is currently focusable.
 * @property {string} WindowIsFullScreenable    - Returns whether the application window is currently fullscreenable.
 * @property {string} SetWindowIsMaximizable    - Updates the maximizable state of the window.
 * @property {string} SetWindowIsClosable       - Updates the closable state of the window.
 * @property {string} SetWindowIsFocusable      - Updates the focusable state of the window.
 * @property {string} SetWindowIsFullScreenable - Updates the fullscreenable state of the window.
 * @property {string} GetWindowData             - Requests the current window state and capabilities.
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
  WindowIsFullScreen: 'window-is-fullscreen',
  ReadyToShow: 'window-ready-to-show',
  WindowHide: 'window-hide',
  WindowClose: 'window-close',
  WindowDestroy: 'window-destroy',
  WindowShow: 'window-show',
  ChangeAppIcon: 'change-app-icon',
  ChangeTrayIcon: 'change-tray-icon',
  ConsoleMessage: 'console-message',
  ElectronCacheValues: 'electron-cache-values',
  Ping: 'ping',
  DOMContentLoaded: 'DOMContentLoaded',
  GetWindowData: 'get-window-data',
  WindowIsMaximizable: 'window-is-maximizable',
  WindowIsClosable: 'window-is-closable',
  WindowIsFocusable: 'window-is-focusable',
  WindowIsFullScreenable: 'window-is-fullScreenable',
  SetWindowIsMaximizable: 'set-window-is-maximizable',
  SetWindowIsClosable: 'set-window-is-closable',
  SetWindowIsFocusable: 'set-window-is-focusable',
  SetWindowIsFullScreenable: 'set-window-is-fullscreenable',
  Resize: 'resize',
  ShowApp: 'tiny-app-is-show',
};

/**
 * A map of event names used with an internal EventEmitter instance.
 * These events are emitted and listened to internally within the application to handle
 * lifecycle events, window state changes, and proxy configurations.
 *
 * @typedef {Object} RootEvents
 * @property {string} IsMaximized        - Emitted when the window enters or exits maximized state.
 * @property {string} IsFocused          - Emitted when the window gains or loses focus.
 * @property {string} IsVisible          - Emitted when the window becomes visible or hidden.
 * @property {string} IsFullScreen       - Emitted when the window enters or exits fullscreen mode.
 * @property {string} SetProxyError      - Emitted when there is an error applying the proxy configuration.
 * @property {string} SetProxy           - Emitted when a proxy configuration is successfully applied.
 * @property {string} Resize             - Emitted when the window is resized.
 * @property {string} Ping               - Emitted as a heartbeat or connectivity check between internal systems.
 * @property {string} Ready              - Emitted when the application has fully initialized and is ready to start.
 * @property {string} CreateFirstWindow  - Emitted to signal the creation of the first application window during startup.
 * @property {string} ReadyToShow        - Emitted when the window is fully initialized and ready to be displayed, but not yet shown.
 * @property {string} DOMContentLoaded   - Emitted when the renderer process completes loading the DOM content.
 * @property {string} ShowApp            - Emitted when the application window is actually shown to the user after being ready.
 * @property {string} IsFullScreenable - Emitted when the fullscreenable state of the window changes.
 * @property {string} IsMaximizable - Emitted when the maximizable state of the window changes.
 * @property {string} IsClosable - Emitted when the closable state of the window changes.
 * @property {string} IsFocusable - Emitted when the focusable state of the window changes.
 */

export const RootEvents = {
  IsFullScreenable: 'IsFullScreenable',
  IsMaximizable: 'IsMaximizable',
  IsClosable: 'IsClosable',
  IsFocusable: 'IsFocusable',
  IsMaximized: 'isMaximized',
  IsFocused: 'isFocused',
  IsVisible: 'isVisible',
  SetProxyError: 'setProxyError',
  SetProxy: 'setProxy',
  Resize: 'resize',
  IsFullScreen: 'IsFullScreen',
  Ping: 'Ping',
  Ready: 'Ready',
  CreateFirstWindow: 'CreateFirstWindow',
  ReadyToShow: 'ReadyToShow',
  DOMContentLoaded: 'DOMContentLoaded',
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
