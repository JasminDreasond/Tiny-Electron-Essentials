import { ipcRenderer } from 'electron';

/**
 * @typedef {Object} EmitOptions
 * @property {number} [timeout] - Timeout in milliseconds before rejecting the request
 */

/**
 * @typedef {Object} SendData
 * @property {string} __requestId
 * @property {unknown} payload
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
   * @typedef {Object} RequestData
   * @property {(value: any) => void} resolve
   * @property {(reason?: any) => void} reject
   * @property {NodeJS.Timeout | null} timeoutId
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
   */
  send(channel, payload, options = {}) {
    const __requestId = crypto.randomUUID();
    /** @type {SendData} */
    const message = { __requestId, payload };

    if (this.#pending.has(__requestId)) return this.send(channel, payload, options);
    return new Promise((resolve, reject) => {
      const timeoutId = options.timeout
        ? setTimeout(() => {
            this.#pending.delete(__requestId);
            reject(new Error('IPC request timeout'));
          }, options.timeout)
        : null;

      this.#pending.set(__requestId, { resolve, reject, timeoutId });
      ipcRenderer.send(channel, message);
    });
  }
}

export default TinyIpcRequestManager;
