import { contextBridge } from 'electron';
import TinyIpcRequestManager from './TinyIpcRequestManager.mjs';

/**
 * TinyDb provides a secure bridge between the Electron renderer process and the main process
 * to perform database queries over IPC. It exposes simple database-like methods (`run`, `all`,
 * `get`, and `query`) to the renderer process using `contextBridge.exposeInMainWorld`.
 *
 * This class is designed to work alongside a `TinyIpcRequestManager` instance
 * and requires an identifier (`id`) to namespace IPC events.
 */
class TinyDb {
  #ipcRequest;
  #exposeInMainWorld = '';
  #id;

  /**
   * Creates a new TinyDb instance.
   *
   * @param {TinyIpcRequestManager} ipcRequest - The IPC request manager instance for communication.
   * @param {string} id - A unique identifier to namespace the IPC events.
   *
   * @throws {Error} If `ipcRequest` is not an instance of `TinyIpcRequestManager`.
   * @throws {Error} If `id` is not a string.
   */
  constructor(ipcRequest, id) {
    if (!(ipcRequest instanceof TinyIpcRequestManager))
      throw new Error('ipcRequest must be an instance of TinyIpcRequestManager.');
    if (typeof id !== 'string') throw new Error('id must be a string.');
    this.#ipcRequest = ipcRequest;
    this.#id = id;
  }

  /**
   * Exposes the TinyDb API to the renderer process via `window[apiName]`.
   *
   * @param {string} [apiName='tinyDb'] - The name under which the API will be exposed in `window`.
   *
   * @throws {Error} If the API is already exposed.
   * @throws {Error} If `apiName` is not a valid non-empty string.
   */
  exposeInMainWorld(apiName = 'tinyDb') {
    if (this.#exposeInMainWorld.length > 0)
      throw new Error(`API '${this.#exposeInMainWorld}' is already exposed in the main world.`);
    if (typeof apiName !== 'string' || apiName.length < 1)
      throw new Error('apiName must be a non-empty string.');
    this.#exposeInMainWorld = apiName;
    contextBridge.exposeInMainWorld(apiName, {
      /**
       * Executes an SQL command that modifies data (`INSERT`, `UPDATE`, `DELETE`)
       * or runs any command without returning rows.
       *
       * @param {string} query - SQL query string.
       * @param {any[]} params - Query parameters.
       * @returns {Promise<any>} Result of the query execution.
       */
      run: (query, params) => this.run(query, params),

      /**
       * Executes a SQL `SELECT` query that returns all matching rows.
       *
       * @param {string} query - SQL query string.
       * @param {any[]} params - Query parameters.
       * @returns {Promise<any[]>} Array of matching rows.
       */
      all: (query, params) => this.all(query, params),

      /**
       * Executes a SQL `SELECT` query that returns a single row.
       *
       * @param {string} query - SQL query string.
       * @param {any[]} params - Query parameters.
       * @returns {Promise<any>} The first row matching the query.
       */
      get: (query, params) => this.get(query, params),

      /**
       * Executes a generic SQL query. The result depends on the query type.
       *
       * @param {string} query - SQL query string.
       * @param {any[]} params - Query parameters.
       * @returns {Promise<any>} Result of the query.
       */
      query: (query, params) => this.query(query, params),
    });
  }

  /**
   * Executes an SQL command that modifies data (`INSERT`, `UPDATE`, `DELETE`)
   * or runs any command without returning rows.
   *
   * @param {string} query - SQL query string.
   * @param {any[]} params - Query parameters.
   * @returns {Promise<any>} Result of the query execution.
   */
  run(query, params) {
    return this.#ipcRequest.send(`${this.#id}_run`, { query, params });
  }

  /**
   * Executes a SQL `SELECT` query that returns all matching rows.
   *
   * @param {string} query - SQL query string.
   * @param {any[]} params - Query parameters.
   * @returns {Promise<any[]>} Array of matching rows.
   */
  all(query, params) {
    return this.#ipcRequest.send(`${this.#id}_all`, { query, params });
  }

  /**
   * Executes a SQL `SELECT` query that returns a single row.
   *
   * @param {string} query - SQL query string.
   * @param {any[]} params - Query parameters.
   * @returns {Promise<any>} The first row matching the query.
   */
  get(query, params) {
    return this.#ipcRequest.send(`${this.#id}_get`, { query, params });
  }

  /**
   * Executes a generic SQL query. The result depends on the query type.
   *
   * @param {string} query - SQL query string.
   * @param {any[]} params - Query parameters.
   * @returns {Promise<any>} Result of the query.
   */
  query(query, params) {
    return this.#ipcRequest.send(`${this.#id}_query`, { query, params });
  }
}

export default TinyDb;
