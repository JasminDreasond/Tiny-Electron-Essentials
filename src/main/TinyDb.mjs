import { BrowserWindow } from 'electron';
import TinyIpcResponder from './TinyIpcResponder.mjs';

/**
 * A function that executes an SQL query against the database.
 * The query can be for fetching data (`SELECT`), modifying data (`UPDATE`, `INSERT`),
 * or any other valid SQL command depending on the method used.
 *
 * @typedef {(query: string, params: any[]) => any} QueryRequest
 */

/**
 * TinyDb is an IPC-based database handler designed for Electron applications.
 * It connects the renderer process to a backend database using IPC events.
 *
 * This class listens to specific IPC events (`run`, `all`, `get`, `query`) identified by a unique ID,
 * allowing the renderer process to execute database operations securely and asynchronously.
 *
 * The class itself does not handle the database logic directly; instead, it acts as an abstract interface.
 * You must extend this class and override its internal methods (`#run`, `#all`, `#get`, `#query`)
 * to provide the actual database functionality.
 */
class TinyDb {
  #ipcResponder;
  #id;

  /**
   * Executes a SQL `SELECT` query that returns a single row.
   *
   * @type {QueryRequest}
   */
  #get = (query = '', params = []) => {
    console.warn('[TinyDb Debug] Called "get" with:', { query, params });
    throw new Error('TinyDb: "get" function is not defined.');
  };

  /**
   * Executes an SQL command that modifies data (`INSERT`, `UPDATE`, `DELETE`)
   * or runs any command without returning rows.
   *
   * @type {QueryRequest}
   */
  #run = (query = '', params = []) => {
    console.warn('[TinyDb Debug] Called "run" with:', { query, params });
    throw new Error('TinyDb: "run" function is not defined.');
  };

  /**
   * Executes a SQL `SELECT` query that returns all matching rows.
   *
   * @type {QueryRequest}
   */
  #all = (query = '', params = []) => {
    console.warn('[TinyDb Debug] Called "all" with:', { query, params });
    throw new Error('TinyDb: "all" function is not defined.');
  };

  /**
   * Executes a generic SQL query. The result depends on the query type.
   *
   * @type {QueryRequest}
   */
  #query = (query = '', params = []) => {
    console.warn('[TinyDb Debug] Called "query" with:', { query, params });
    throw new Error('TinyDb: "query" function is not defined.');
  };

  /**
   * Set the implementation for the `get` operation.
   * Use this for queries that fetch a single row.
   *
   * @param {QueryRequest} callback - The function to execute a `get` query.
   */
  setGet(callback) {
    if (typeof callback !== 'function') throw new Error('setGet callback must be a function');
    this.#get = callback;
  }

  /**
   * Set the implementation for the `run` operation.
   * Use this for queries that modify data (`INSERT`, `UPDATE`, `DELETE`).
   *
   * @param {QueryRequest} callback - The function to execute a `run` query.
   */
  setRun(callback) {
    if (typeof callback !== 'function') throw new Error('setRun callback must be a function');
    this.#run = callback;
  }

  /**
   * Set the implementation for the `all` operation.
   * Use this for queries that return multiple rows.
   *
   * @param {QueryRequest} callback - The function to execute an `all` query.
   */
  setAll(callback) {
    if (typeof callback !== 'function') throw new Error('setAll callback must be a function');
    this.#all = callback;
  }

  /**
   * Set the implementation for the `query` operation.
   * Use this for any generic query, depending on the backend.
   *
   * @param {QueryRequest} callback - The function to execute a `query` operation.
   */
  setQuery(callback) {
    if (typeof callback !== 'function') throw new Error('setQuery callback must be a function');
    this.#query = callback;
  }

  /**
   * Retrieves the `BrowserWindow` instance that originated the IPC event.
   *
   * @param {Electron.IpcMainEvent} event - The IPC event from which to extract the window.
   * @returns {BrowserWindow|null} The associated `BrowserWindow` or `null` if not found.
   */
  #getWin(event) {
    const webContents = event.sender;
    if (!event.senderFrame) return null;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) return win;
    return null;
  }

  /**
   * Creates a new TinyDb instance linked to a specific IPC responder and identifier.
   * Sets up listeners to handle database-related IPC calls (`run`, `all`, `get`, `query`).
   *
   * @param {TinyIpcResponder} ipcResponder - The IPC responder instance used for communication.
   * @param {string} id - A unique identifier to namespace the IPC events.
   */
  constructor(ipcResponder, id) {
    if (!(ipcResponder instanceof TinyIpcResponder))
      throw new Error('Invalid ipcResponder instance.');
    if (typeof id !== 'string') throw new Error('id must be a string.');
    this.#ipcResponder = ipcResponder;
    this.#id = id;

    this.#ipcResponder.on(`${this.#id}_run`, async (event, value, res) => {
      const win = this.#getWin(event);
      if (win) {
        const { query, params } = value;
        const result = await this.#run(query, params);
        res(result);
      } else res(null);
    });

    this.#ipcResponder.on(`${this.#id}_all`, async (event, value, res) => {
      const win = this.#getWin(event);
      if (win) {
        const { query, params } = value;
        const result = await this.#all(query, params);
        res(result);
      } else res(null);
    });

    this.#ipcResponder.on(`${this.#id}_get`, async (event, value, res) => {
      const win = this.#getWin(event);
      if (win) {
        const { query, params } = value;
        const result = await this.#get(query, params);
        res(result);
      } else res(null);
    });

    this.#ipcResponder.on(`${this.#id}_query`, async (event, value, res) => {
      const win = this.#getWin(event);
      if (win) {
        const { query, params } = value;
        const result = await this.#query(query, params);
        res(result);
      } else res(null);
    });
  }
}

export default TinyDb;
