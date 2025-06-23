# 📦 TinyDb

TinyDb is a simple and secure IPC-based database handler for **Electron apps**.  
It provides a bridge between the **main process** and the **renderer process** for executing SQL-like queries using IPC events.

> ⚠️ **Note:** This is an abstract class. It does not handle databases by itself. You must extend it and implement the logic for each database operation (`get`, `run`, `all`, `query`).

---

## 🎯 Purpose

- Provide a secure database communication layer using IPC.  
- Allow the renderer to perform queries without direct access to Node.js APIs.  
- Fully customizable backend (SQLite, MySQL, PostgreSQL, etc.).  

---

## 🚀 Features

- 🔒 IPC-based query handling  
- 🔌 Async/await support  
- 🧠 Extensible architecture (you implement the DB logic)  
- 🗂️ Handles:  
  - `get` → Fetch one row  
  - `all` → Fetch multiple rows  
  - `run` → Insert, update, delete  
  - `query` → Custom queries  

---

## 🏗️ Constructor

```js
new TinyDb(ipcResponder, id)
```

| Param          | Type               | Description                                       |
| -------------- | ------------------ | ------------------------------------------------- |
| `ipcResponder` | `TinyIpcResponder` | The IPC responder instance for handling requests. |
| `id`           | `string`           | Unique identifier for IPC event namespacing.      |

---

## 🧠 Methods

### 🔧 setGet(callback)

Set the function for `get` queries (fetch **a single row**).

```js
setGet((query, params) => { ... })
```

| Param      | Type                     | Description                               |
| ---------- | ------------------------ | ----------------------------------------- |
| `callback` | `(query, params) => any` | Function to execute `SELECT ... LIMIT 1`. |

---

### 🔧 setRun(callback)

Set the function for `run` queries (for **modifying data**).

```js
setRun((query, params) => { ... })
```

| Param      | Type                     | Description                                     |
| ---------- | ------------------------ | ----------------------------------------------- |
| `callback` | `(query, params) => any` | Function for `INSERT`, `UPDATE`, `DELETE`, etc. |

---

### 🔧 setAll(callback)

Set the function for `all` queries (fetch **multiple rows**).

```js
setAll((query, params) => { ... })
```

| Param      | Type                     | Description                     |
| ---------- | ------------------------ | ------------------------------- |
| `callback` | `(query, params) => any` | Function to execute `SELECT *`. |

---

### 🔧 setQuery(callback)

Set the function for **generic queries** (useful for engines that support other types of commands).

```js
setQuery((query, params) => { ... })
```

| Param      | Type                     | Description                 |
| ---------- | ------------------------ | --------------------------- |
| `callback` | `(query, params) => any` | Any generic database query. |

---

## 🔐 Private Method

### 🪟 #getWin(event)

Retrieve the `BrowserWindow` instance from the IPC event.

```js
#getWin(event) → BrowserWindow | null
```

| Param   | Type                    | Description                                    |
| ------- | ----------------------- | ---------------------------------------------- |
| `event` | `Electron.IpcMainEvent` | IPC event object from which to get the window. |

---

## 📡 IPC Events Handled

All events are dynamically namespaced with the provided `id`.

| Event Name    | Description        |
| ------------- | ------------------ |
| `${id}_run`   | Executes `run()`   |
| `${id}_all`   | Executes `all()`   |
| `${id}_get`   | Executes `get()`   |
| `${id}_query` | Executes `query()` |

---

## ⚙️ Example Usage

```js
import TinyDb from './TinyDb.mjs';
import TinyIpcResponder from './TinyIpcResponder.mjs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const ipcResponder = new TinyIpcResponder('appDb');

const db = new TinyDb(ipcResponder, 'appDb');

(async () => {
  const sqlDb = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });

  db.setGet((query, params) => sqlDb.get(query, params));
  db.setAll((query, params) => sqlDb.all(query, params));
  db.setRun((query, params) => sqlDb.run(query, params));
  db.setQuery((query, params) => sqlDb.all(query, params)); // Optional
})();
```

---

## 💡 Notes

* If a method (`get`, `run`, `all`, `query`) is not set, calling it will throw an error.
* This class ensures that the renderer cannot directly access the filesystem or Node APIs — only the methods you expose are allowed.

---

## 🏁 Conclusion

TinyDb is the perfect lightweight solution for safe database operations in Electron apps using IPC.
Fully extendable, async-ready, and secure for production apps. 🚀
