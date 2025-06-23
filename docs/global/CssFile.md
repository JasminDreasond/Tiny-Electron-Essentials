# 🎨 CSS File Utilities

This module provides helper functions to **create and manage CSS styles** used in custom Electron window frames.
It contains functions to write `.css` files to disk, generate root-level CSS variables, and dynamically produce styles for the window frame using a component class generator.

---

## 🔧 `saveCssFile(directory, filename, cssContent)`

Safely writes a `.css` file to the given directory after validating inputs.

### Parameters

| Name         | Type     | Description                   |
| ------------ | -------- | ----------------------------- |
| `directory`  | `string` | Path to the target directory  |
| `filename`   | `string` | Must end with `.css`          |
| `cssContent` | `string` | Valid CSS content to be saved |

### Returns

* `Promise<void>` — Resolves when the file is saved.

### Throws

* Error if directory doesn’t exist
* Error for invalid filenames or content
* Error if file write fails

---

## 🌱 `getDefaultWindowFrameRoot()`

Returns a string of CSS variables under `:root` used to style the custom window frame UI.

### Example CSS Variables:

* `--frame-height`
* `--frame-background`
* `--frame-title-font-size`
* `--frame-button-hover-background`

### Returns

* `string` — CSS string with root variables

---

## 🎭 `getDefaultWindowFrameStyle(settings)`

Generates CSS rules for the entire window frame interface based on customizable settings.

### Parameters

| Name                       | Type       | Description                                         |
| -------------------------- | ---------- | --------------------------------------------------- |
| `settings.getElementName`  | `Function` | Required. Generates scoped selectors (class → CSS). |
| `settings.fullscreenClass` | `string`   | Class added to `<body>` during fullscreen.          |
| `settings.blurClass`       | `string`   | Class added to `<body>` in blur mode.               |
| `settings.maximizedClass`  | `string`   | Class added to `<body>` in maximized mode.          |

### Returns

* `string` — A CSS string containing styles for borders, layout, title, icons, buttons, etc.

### Throws

* Error if `getElementName` is missing or not a function.
* Error if any of the mode class strings are not valid.

---

## 🧠 Use Case

These functions are designed for apps using Electron’s `transparent + frameless + custom UI` approach. By generating CSS dynamically, they allow consistent theming, adjustable layouts, and runtime style switching.

---

## 💡 Tip

To isolate CSS styles from conflicting with other global styles, use a scoped class generator (`getElementName`) to prefix or map selectors properly before writing or injecting the CSS.
