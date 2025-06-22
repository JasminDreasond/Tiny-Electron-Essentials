# 🗄️ TinyDb – Secure IPC Database Bridge for Electron

TinyDb provides a secure and simple bridge between the Electron renderer process and the main process for executing database queries over IPC. It offers common SQL-like methods — `run`, `all`, `get`, and `query` — directly in the renderer via `contextBridge`.

> 🔒 All communications happen securely through the `TinyIpcRequestManager`.

---

## 🚀 Features

* 🔗 Secure IPC communication for database operations.
* 🗃️ Simple SQL-like methods exposed in the renderer (`run`, `all`, `get`, `query`).
* 🚫 No direct database access from the renderer.
* 🧠 Easy to namespace multiple databases using `id`.
* 🔥 Fully integrated with Electron's `contextBridge`.

---

## 🏗️ Class: `TinyDb`

```js
import TinyDb from './TinyDb.js';
```

### 🔧 Constructor

```js
const db = new TinyDb(ipcRequestManager, 'databaseId');
```

| Parameter    | Type                    | Description                                    |
| ------------ | ----------------------- | ---------------------------------------------- |
| `ipcRequest` | `TinyIpcRequestManager` | The IPC request manager instance.              |
| `id`         | `string`                | Unique identifier to namespace the IPC events. |

#### ⚠️ Throws

* `Error` — If `ipcRequest` is not an instance of `TinyIpcRequestManager`.
* `Error` — If `id` is not a string.

---

## 🌐 Method: `exposeInMainWorld(apiName)`

Exposes the TinyDb API to the renderer process via `window[apiName]`.

```js
db.exposeInMainWorld('tinyDb');
```

| Parameter | Type     | Default    | Description                          |
| --------- | -------- | ---------- | ------------------------------------ |
| `apiName` | `string` | `'tinyDb'` | Name of the API exposed in `window`. |

### 🪄 What it does

* Makes the following methods available in the renderer:

```js
window.tinyDb.run(query, params);
window.tinyDb.all(query, params);
window.tinyDb.get(query, params);
window.tinyDb.query(query, params);
```

#### ⚠️ Throws

* `Error` — If the API is already exposed.
* `Error` — If `apiName` is not a valid non-empty string.

---

## 🔥 Database Methods

All methods are asynchronous and return `Promise`.

### 📥 `run(query, params)`

Executes SQL commands that modify data (`INSERT`, `UPDATE`, `DELETE`) or other statements that do not return rows.

```js
await window.tinyDb.run('INSERT INTO users (name) VALUES (?)', ['Alice']);
```

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `query`   | `string` | SQL query string |
| `params`  | `any[]`  | Query parameters |

→ 🔄 Returns: `Promise<any>`

---

### 📤 `all(query, params)`

Executes a `SELECT` query and returns all matching rows.

```js
const users = await window.tinyDb.all('SELECT * FROM users', []);
```

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `query`   | `string` | SQL query string |
| `params`  | `any[]`  | Query parameters |

→ 🔄 Returns: `Promise<any[]>` (Array of rows)

---

### 🎯 `get(query, params)`

Executes a `SELECT` query and returns the **first matching row**.

```js
const user = await window.tinyDb.get('SELECT * FROM users WHERE id = ?', [1]);
```

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `query`   | `string` | SQL query string |
| `params`  | `any[]`  | Query parameters |

→ 🔄 Returns: `Promise<any>` (Single row)

---

### 🔍 `query(query, params)`

Executes any SQL query. The returned result depends on the query type.

```js
const result = await window.tinyDb.query('PRAGMA user_version', []);
```

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `query`   | `string` | SQL query string |
| `params`  | `any[]`  | Query parameters |

→ 🔄 Returns: `Promise<any>`

---

## 🧠 Usage Example

### 🎯 Expose the API in the preload script:

```js
import { contextBridge } from 'electron';
import TinyDb from './TinyDb.js';
import TinyIpcRequestManager from './TinyIpcRequestManager.js';

const ipcRequest = new TinyIpcRequestManager();
const db = new TinyDb(ipcRequest, 'mainDb');

db.exposeInMainWorld('tinyDb');
```

### 🚀 Use it in the renderer process:

```js
// Insert data
await window.tinyDb.run('INSERT INTO users (name) VALUES (?)', ['Alice']);

// Fetch all users
const users = await window.tinyDb.all('SELECT * FROM users', []);

// Fetch single user
const user = await window.tinyDb.get('SELECT * FROM users WHERE id = ?', [1]);

// Run generic query
const pragma = await window.tinyDb.query('PRAGMA user_version', []);
```

---

## 💡 Notes

* ✔️ Uses namespaced IPC channels like `'mainDb_run'`, `'mainDb_all'`, etc.
* 🔐 Safe from direct database access in the renderer.
* 🎯 Requires `TinyIpcRequestManager` to handle IPC communication.

---

## 🏆 Credits

* Developed with ❤️ for secure and reliable database interaction in Electron.
