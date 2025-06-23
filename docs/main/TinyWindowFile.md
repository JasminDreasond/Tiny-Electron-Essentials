# 🗂️ TinyWindowFile

**TinyWindowFile** is a lightweight utility for managing window-specific configuration files in an Electron app. 🎯

It handles reading and storing window bounds (size, position) and maximized state, based on JSON files. This ensures that each window can remember its size and position between app launches! 🔥

---

## 🎯 Purpose

- 🗄️ Load and store window configurations.
- 📏 Manage window bounds (`width`, `height`, `x`, `y`).
- 🪟 Track whether the window was maximized.
- 🔒 Keep configurations isolated per window file.

---

## 🚀 Features

- 🔥 Load configurations from JSON files.
- 💾 Get window bounds and maximized state.
- ❓ Check if a window config exists.
- ✅ Data validation included.
- 🧽 Automatically applies fallback defaults if the file is invalid or missing.

---

## 🏗️ Constructor

This class does not require a constructor with arguments. Just instantiate it:

```js
const fileManager = new TinyWindowFile();
```

---

## 🧠 Methods

---

### 📥 loadFile(initFile, settings?)

Loads window configuration from a JSON file.

```js
instance.loadFile(initFile, { bounds }?)
```

| Parameter  | Type   | Default                                  | Description               |
| ---------- | ------ | ---------------------------------------- | ------------------------- |
| `initFile` | string | *(Required)*                             | Path to the JSON file.    |
| `settings` | object | `{ bounds: { width:1200, height:700 } }` | Optional fallback bounds. |

* Loads data like `{ bounds: { width, height, x, y }, maximized: true }` from the file.
* If the file doesn't exist or is invalid, it uses fallback bounds.

> ⚠️ Throws if `initFile` is not a string or if bounds are invalid.

---

### 📤 getData(id)

Retrieves the full window configuration (bounds + maximized) previously loaded.

```js
const data = instance.getData(id);
```

| Parameter | Type   | Description                            |
| --------- | ------ | -------------------------------------- |
| `id`      | string | The same file path used in `loadFile`. |

| Returns | Type         | Description             |
| ------- | ------------ | ----------------------- |
|         | `InitConfig` | `{ bounds, maximized }` |

> ⚠️ Throws if `id` is not registered.

---

### 🔍 hasId(id)

Checks if a configuration for this ID is loaded.

```js
const exists = instance.hasId(id);
```

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| `id`      | string | The file path or identifier. |

| Returns | Type      | Description                          |
| ------- | --------- | ------------------------------------ |
|         | `boolean` | `true` if exists, `false` otherwise. |

> ⚠️ Throws if `id` is not a string.

---

### 📐 getBounds(id)

Gets the window bounds for the specified ID.

```js
const bounds = instance.getBounds(id);
```

| Parameter | Type   | Description                            |
| --------- | ------ | -------------------------------------- |
| `id`      | string | The same file path used in `loadFile`. |

| Returns | Type     | Description                 |
| ------- | -------- | --------------------------- |
|         | `Bounds` | `{ width, height, x?, y? }` |

> ⚠️ Throws if `id` is not found or invalid.

---

## 💾 Data Structure

### 🏗️ InitConfig

```ts
{
  bounds?: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  maximized?: boolean;
}
```

---

## 🔥 Example Usage

```js
import TinyWindowFile from './TinyWindowFile.mjs';

// Create instance
const fileManager = new TinyWindowFile();

// Load window configuration
fileManager.loadFile('./config/window-main.json', {
  bounds: { width: 1000, height: 700 },
});

// Get full config
const config = fileManager.getData('./config/window-main.json');

console.log(config);
// { bounds: { width: 1000, height: 700, x: 50, y: 50 }, maximized: false }

// Get only bounds
const bounds = fileManager.getBounds('./config/window-main.json');

console.log(bounds);
// { width: 1000, height: 700, x: 50, y: 50 }

// Check if it was loaded
console.log(fileManager.hasId('./config/window-main.json'));
// true
```

---

## 🚧 Error Handling

* ❌ Throws if `initFile` or `id` are not strings.
* ❌ Throws if bounds are not valid numbers (`width`, `height`, optionally `x` and `y`).
* ✅ Gracefully defaults to fallback bounds if the file doesn't exist or has invalid content.

---

## 🎁 Summary

**TinyWindowFile** is the perfect tool for keeping your Electron window states organized! 🎨
No more losing window sizes or positions — everything is saved, restored, and validated. ✔️
