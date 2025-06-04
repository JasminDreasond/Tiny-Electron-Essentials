import { ipcRenderer } from 'electron';

/**
 * Options for customizing the IPC emit behavior.
 *
 * @typedef {Object} EmitOptions
 * @property {number} [timeout] - Optional timeout in milliseconds. If defined, the request will automatically reject if no response is received in this time.
 */

/**
 * The data structure used to send a message through IPC.
 *
 * @typedef {Object} SendData
 * @property {string} __requestId - A unique identifier for correlating the request and its response.
 * @property {unknown} payload - The actual data being sent with the request.
 */

/**
 * @typedef {Object} SendResult
 * @property {string} __requestId
 * @property {unknown} payload
 * @property {Error|null} error
 */

class TinyIpcRequestManager {
  /** @typedef {import('electron').IpcMainEvent} IpcMainEvent */

  /**
   * Internal structure used to track a pending request and its associated handlers.
   *
   * @typedef {Object} RequestData
   * @property {(value: any) => void} resolve - Function used to resolve the Promise once a response is received.
   * @property {(reason?: any) => void} reject - Function used to reject the Promise if an error occurs or it times out.
   * @property {NodeJS.Timeout | null} timeoutId - Optional timeout reference, used to clear the timeout if the response arrives in time.
   */

  /** @type {Map<string, RequestData>} */
  #pending = new Map();

  constructor() {
    /** @type {(event: IpcMainEvent, arg: SendResult) => void} */
    ipcRenderer.on('ipc-response', (_event, data) => {
      const { __requestId, payload, error } = data || {};
      const item = this.#pending.get(__requestId);
      if (item) {
        const { resolve, reject, timeoutId } = item;
        if (timeoutId) clearTimeout(timeoutId);

        this.#pending.delete(__requestId);
        error ? reject(error) : resolve(payload);
      }
    });
  }

  /**
   * Sends a request and returns a promise that resolves on response
   * @param {string} channel - The ipcRenderer channel to send
   * @param {any} payload - The data to send with the request
   * @param {EmitOptions} [options]
   * @returns {Promise<unknown>}
   * @throws {Error} If the channel or options are invalid
   */
  send(channel, payload, options = {}) {
    if (typeof channel !== 'string' || channel.trim() === '')
      throw new Error('IPC send error: "channel" must be a non-empty string');

    if ('timeout' in options) {
      if (typeof options.timeout !== 'number' || options.timeout <= 0)
        throw new Error('IPC send error: "timeout" must be a positive number');
    }

    const __requestId = crypto.randomUUID();
    /** @type {SendData} */
    const message = { __requestId, payload };

    if (this.#pending.has(__requestId)) {
      console.warn(`Duplicate __requestId detected: ${__requestId}. Retrying with a new ID...`);
      return this.send(channel, payload, options);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = options.timeout
        ? setTimeout(() => {
            this.#pending.delete(__requestId);
            reject(new Error(`IPC request timeout after ${options.timeout}ms`));
          }, options.timeout)
        : null;

      this.#pending.set(__requestId, { resolve, reject, timeoutId });
      ipcRenderer.send(channel, message);
    });
  }
}

export default TinyIpcRequestManager;
