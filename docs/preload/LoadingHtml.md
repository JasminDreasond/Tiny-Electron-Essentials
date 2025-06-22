# 🎨 Electron Loading & Overlay Styles

A simple utility to create loading screens and transparent overlays for Electron apps using pure JavaScript and CSS.

> Inspired by awesome CSS loaders:

* 🔗 [SpinKit](https://tobiasahlin.com/spinkit)
* 🔗 [Loaders](https://connoratherton.com/loaders)
* 🔗 [CSS Loaders](https://projects.lukehaas.me/css-loaders)
* 🔗 [SpinThatShit](https://matejkustec.github.io/SpinThatShit)

---

## 📦 Features

* 🌀 CSS-based loading animation
* 🪟 Transparent window overlays
* ✨ Fully customizable via JavaScript
* 🚫 Mouse interaction blocking (for overlays)
* ⚡ Simple integration with Electron

---

## 🏗️ Exports

### 1. `defaultLoadingStyleCreator()`

Creates the default loading animation and styles.

```js
import { defaultLoadingStyleCreator } from './your-file.js';
```

#### ✅ Returns

```js
{
  styleContent: string, // CSS styles as string
  html: string           // HTML markup for the loader
}
```

#### 🎨 Description

* Creates a simple 3D square spin animation.
* Adds a dark fullscreen background with the loader centered.

---

### 2. `transparentOverlayStyle()`

Creates a fullscreen transparent overlay that blocks all user interaction.

```js
import { transparentOverlayStyle } from './your-file.js';
```

#### ✅ Returns

```js
{
  styleContent: string, // CSS styles as string
  html: string           // HTML markup for the overlay
}
```

#### 🧠 Behavior

* Makes the entire window transparent.
* Disables all pointer events and hides all content.
* Useful for splash screens, blocking interaction, or transitions.

---

### 3. `getLoadingHtml(settings)`

Generates the style and DOM elements for the loading screen.

```js
import { getLoadingHtml } from './your-file.js';
```

#### 🔧 Parameters

| Name              | Type                           | Default                                       | Description                        |
| ----------------- | ------------------------------ | --------------------------------------------- | ---------------------------------- |
| `settings`        | `GetLoadingHtml` (optional)    | `{}`                                          | Settings object                    |
| └─ `id`           | `string`                       | `'app-loading-style'`                         | ID of the `<style>` element        |
| └─ `className`    | `string`                       | `'app-loading-wrap root-electron-style-solo'` | Class name of the wrapper `<div>`  |
| └─ `styleCreator` | `() => { styleContent, html }` | `defaultLoadingStyleCreator`                  | Function that returns CSS and HTML |

#### ✅ Returns

```js
{
  oStyle: HTMLStyleElement, // The <style> element with injected CSS
  oDiv: HTMLDivElement      // The <div> element with the loader HTML
}
```

#### ⚠️ Throws

* `TypeError` — If `styleCreator` is not a function.
* `Error` — If `styleCreator` doesn't return the expected `{styleContent, html}`.
* `TypeError` — If `id` or `className` are not strings.

---

## 🔍 Type Definitions

### `DefaultStyleCreator`

```ts
() => {
  styleContent: string;
  html: string;
}
```

* Generates CSS and HTML for the component.

---

### `GetLoadingHtml`

```ts
{
  id?: string;
  className?: string;
  styleCreator?: DefaultStyleCreator;
}
```

* Defines the settings for `getLoadingHtml()`.

---

## 🚀 Usage Example

```js
import { getLoadingHtml } from './your-file.js';

const { oStyle, oDiv } = getLoadingHtml();

document.head.appendChild(oStyle);
document.body.appendChild(oDiv);
```

🛑 **To remove it later:**

```js
oStyle.remove();
oDiv.remove();
```

---

## 🎯 Notes

* `-webkit-app-region: drag` is applied, making the area draggable in Electron frameless windows.
* You can customize the CSS and HTML by providing your own `styleCreator`.

---

## 💖 Credits

* Inspired by open-source CSS loader projects.
* Developed with care to improve UX in Electron apps.
