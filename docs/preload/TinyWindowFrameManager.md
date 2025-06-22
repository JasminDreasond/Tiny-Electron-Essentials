# 📦 TinyWindowFrameManager

A powerful, fully customizable window frame manager for **Electron frameless windows** (`frame: false`). It replaces the native window frame with a flexible, beautiful, and fully programmable HTML/CSS/JS layout.

---

## 🚀 Features

* ✨ Fully draggable top bar and borders.
* 🔘 Highly customizable buttons (minimize, maximize, close):

  * Change order (`buttonsMap`).
  * Set position (`left` or `right`).
  * Change icons dynamically.
* 🏷️ Configurable window title alignment (`left`, `center`, `right`).
* 🍔 Dynamic menu sections (`left` and `right`) with support for buttons, icons, and custom elements.
* 🔄 Reacts to window state changes:

  * `focus`, `blur`, `maximize`, `unmaximize`, `fullscreen`.
* 🎨 Dynamic CSS injection:

  * Use default styles or supply your own completely.
* 💡 Zero dependencies:

  * Pure HTML, CSS, and JS.
* 💾 Save CSS to disk easily.

---

## 🔧 Requirements

* Works only with Electron windows that have:

  * `frame: false`
  * `titleBarStyle: 'hidden'`
  * Optionally `transparent: true`
* Requires an Electron client manager like [`TinyElectronClient`](./TinyElectronClient.md) to handle window actions (`minimize`, `maximize`, etc.).

---

## 🛠️ Constructor

```js
const frame = new TinyWindowFrameManager({
  client,
  titlePosition: 'center',
  buttonsPosition: 'right',
  buttonsMap: ['minimize', 'maximize', 'close'],
  icons: {
    minimize: '🗕',
    maximize: '🗖',
    unmaximize: '🗗',
    close: '🗙',
  },
  classes: {
    focus: 'win-focus',
    blur: 'win-blur',
    fullscreen: 'win-fullscreen',
    maximized: 'win-maximized',
  },
});
```

### ⚙️ Options

| Option               | Type                                        | Default                             | Description                        |
| -------------------- | ------------------------------------------- | ----------------------------------- | ---------------------------------- |
| `client`             | `TinyElectronClient`                        | **Required**                        | Electron window control handler    |
| `applyDefaultStyles` | `boolean`                                   | `true`                              | Apply the default CSS theme        |
| `windowRoot`         | `string`                                    | `'window-root'`                     | ID of the root container           |
| `buttonsPosition`    | `'left'` or `'right'`                       | `'right'`                           | Where control buttons are placed   |
| `titlePosition`      | `'left'` `'center'` `'right'`               | `'center'`                          | Title text alignment               |
| `buttonsMap`         | `string[]`                                  | `['minimize', 'maximize', 'close']` | Button order & inclusion           |
| `icons`              | `{ minimize, maximize, unmaximize, close }` | Emoji defaults                      | Button icons (innerHTML or string) |
| `classes`            | `{ blur, focus, fullscreen, maximized }`    | CSS class defaults                  | Class names for window state       |

---

## 🎯 Public Methods

### 📍 `getElementName(name, extra, extra2)`

Generate the full element selector name with window root prefix.

| Param    | Type     | Default | Description         |
| -------- | -------- | ------- | ------------------- |
| `name`   | `string` | `''`    | Base name           |
| `extra`  | `string` | `''`    | Appended after root |
| `extra2` | `string` | `''`    | Prepended           |

---

### 💾 `saveCssFileStructure(directory, filename)`

Save the CSS (`root` or `default`) into a file.

| Param       | Type                    | Description       |
| ----------- | ----------------------- | ----------------- |
| `directory` | `string`                | Folder path       |
| `filename`  | `'default'` or `'root'` | Which CSS to save |

---

### 🎨 `applyCustomStyle(css)`

Inject custom CSS.

| Param | Type     | Description         |
| ----- | -------- | ------------------- |
| `css` | `string` | CSS string to apply |

---

### 🔍 `getHtml(name)`

Get a container element.

| Name            | Element              |
| --------------- | -------------------- |
| `'rootContent'` | Main app content     |
| `'root'`        | Root frame container |
| `'frame'`       | Outer frame          |
| `'top'`         | Top bar              |
| `'menuLeft'`    | Left menu            |
| `'menuRight'`   | Right menu           |
| `'icon'`        | App icon             |
| `'title'`       | Title                |
| `'topLeft'`     | Left border          |
| `'topCenter'`   | Center border (top)  |
| `'topRight'`    | Right border         |

---

### 🔘 `getButtonHtml(name)`

Get buttons or button container.

| Name         | Element                   |
| ------------ | ------------------------- |
| `'root'`     | Button container          |
| `'minimize'` | Minimize button           |
| `'maximize'` | Maximize / Restore button |
| `'close'`    | Close button              |

---

### 🖼️ `setIcon(url)`

Set an icon image in the title bar.

| Param | Type     | Description                      |
| ----- | -------- | -------------------------------- |
| `url` | `string` | Image URL. Empty string removes. |

---

### 🚫 `removeIcon()`

Remove the window icon.

---

### 🏷️ `setTitle(text)`

Set the window title.

| Param  | Type     | Description        |
| ------ | -------- | ------------------ |
| `text` | `string` | Window title label |

---

## 🍔 Menu Management

### ➕ `addMenuCustomElement(element, position)`

Add a custom HTML element to a menu.

| Param      | Type                | Default  | Description       |
| ---------- | ------------------- | -------- | ----------------- |
| `element`  | `HTMLElement`       |          | Element to insert |
| `position` | `'left' \| 'right'` | `'left'` | Menu side         |

---

### ➕ `addMenuButton(label, { onClick, position, id })`

Add a clickable button to the menu.

| Param      | Type                  | Description                         |           |
| ---------- | --------------------- | ----------------------------------- | --------- |
| `label`    | `string`              | Button label                        |           |
| `onClick`  | `function`            | Button click event handler          |           |
| `position` | `'left'` \| `'right'` | `'left'`                            | Menu side |
| `id`       | `string`              | Optional button ID (`data-menu-id`) |           |

---

### ➖ `removeMenuButton(idOrElement, position)`

Remove a menu button by ID or element.

| Param         | Type                      | Description   |           |
| ------------- | ------------------------- | ------------- | --------- |
| `idOrElement` | `string` \| `HTMLElement` | ID or element |           |
| `position`    | `'left'` \| `'right'`     | `'left'`      | Menu side |

---

### 🗑️ `clearMenu(position)`

Remove all items from a menu.

| Param      | Type                  | Default  | Description |
| ---------- | --------------------- | -------- | ----------- |
| `position` | `'left'` \| `'right'` | `'left'` | Menu side   |

---

### 👁️ `showMenu(position)`

Show a menu with fade-in effect.

---

### 🙈 `hideMenu(position, fadeOutTime)`

Hide a menu with fade-out.

| Param         | Type                  | Default  | Description              |
| ------------- | --------------------- | -------- | ------------------------ |
| `position`    | `'left'` \| `'right'` | `'left'` | Menu side                |
| `fadeOutTime` | `number`              | `200`    | Duration in milliseconds |

---

## 🧠 Internal Helpers

* 🏗️ `#applyDefaultStyles(applyDefaultStyles)`
* 🔎 `#checkMenuVisibility()`

*(Internal use — manages CSS and menu visibility.)*

---

## 💡 Example Usage

```js
const frame = new TinyWindowFrameManager({
  client: myClient,
  buttonsPosition: 'right',
  titlePosition: 'center',
});

frame.setTitle('My App');
frame.setIcon('./assets/icon.png');

frame.addMenuButton('Settings', {
  onClick: () => openSettings(),
  position: 'right',
});

frame.showMenu('right');
```
