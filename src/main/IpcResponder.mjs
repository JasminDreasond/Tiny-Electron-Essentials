import { ipcMain } from 'electron';

/**
 * @typedef {import('../preload/IpcRequestManager.mjs').SendData} SendData
 */

/**
 * @typedef {import('../preload/IpcRequestManager.mjs').SendResult} SendResult
 */

class TinyIpcResponder {
  /** @typedef {import('electron').IpcMainEvent} IpcMainEvent */

  /** @typedef {(event: IpcMainEvent, arg: SendData) => void} EventEmit */

  /** @type {Map<string, EventEmit>} */
  #handlers = new Map();

  /**
   * Register a channel listener that can use requestId to respond.
   *
   * @param {string} channel - Channel name for listening
   * @param {(payload: any, respond: (response: any, error?: any) => void, event: Electron.IpcMainEvent) => void} handler
   * @throws {Error} If the channel is invalid or handler is not a function
   * @throws {Error} If a handler is already registered for the channel
   */
  on(channel, handler) {
    if (typeof channel !== 'string' || channel.trim() === '')
      throw new Error('IPC on error: "channel" must be a non-empty string');
    if (typeof handler !== 'function')
      throw new Error('IPC on error: "handler" must be a function');

    if (this.#handlers.has(channel))
      throw new Error(`Handler already registered for channel "${channel}"`);

    /** @type {EventEmit} */
    const wrappedHandler = (event, { __requestId, payload }) => {
      if (typeof __requestId !== 'string' || __requestId.trim() === '') {
        console.warn(`Received event without valid __requestId on channel "${channel}"`);
        return;
      }

      /** @type {(response: unknown, error: Error|null) => void} */
      const respond = (response, error = null) => {
        /** @type {SendResult} */
        const result = {
          __requestId,
          payload: response,
          error,
        };

        event.sender.send('ipc-response', result);
      };

      handler(payload, respond, event);
    };

    this.#handlers.set(channel, wrappedHandler);
    ipcMain.on(channel, wrappedHandler);
  }

  /**
   * Cancel the listener of a channel
   *
   * @param {string} channel - Channel name to remove listener from
   * @throws {Error} If the channel is invalid
   * @throws {Error} If no handler is registered for the channel
   */
  off(channel) {
    if (typeof channel !== 'string' || channel.trim() === '')
      throw new Error('IPC off error: "channel" must be a non-empty string');

    const handler = this.#handlers.get(channel);
    if (!handler) throw new Error(`No handler registered for channel "${channel}"`);

    ipcMain.removeListener(channel, handler);
    this.#handlers.delete(channel);
  }

  /**
   * Cancel all registered listeners by this instance
   */
  clear() {
    for (const [channel, handler] of this.#handlers) {
      ipcMain.removeListener(channel, handler);
    }
    this.#handlers.clear();
  }
}

export default TinyIpcResponder;
