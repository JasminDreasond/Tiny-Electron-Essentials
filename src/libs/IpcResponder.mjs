import { ipcMain } from 'electron';

/**
 * @typedef {import('./IpcRequestManager.mjs').SendData} SendData
 */

/**
 * @typedef {import('./IpcRequestManager.mjs').SendResult} SendResult
 */

class TinyIpcResponder {
  /** @typedef {import('electron').IpcMainEvent} IpcMainEvent */

  /** @typedef {(event: IpcMainEvent, arg: SendData) => void} EventEmit */

  /** @type {Map<string, EventEmit>} */
  #handlers = new Map();

  /**
   * Registra um listener de canal que pode usar requestId para responder
   * @param {string} channel - Nome do canal para escutar
   * @param {(payload: any, respond: (response: any, error?: any) => void, event: Electron.IpcMainEvent) => void} handler
   */
  on(channel, handler) {
    if (this.#handlers.has(channel)) {
      throw new Error(`Handler already registered for channel "${channel}"`);
    }

    /** @type {EventEmit} */
    const wrappedHandler = (event, { __requestId, payload }) => {
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
   * Cancela o listener de um canal
   * @param {string} channel
   */
  off(channel) {
    const handler = this.#handlers.get(channel);
    if (handler) {
      ipcMain.removeListener(channel, handler);
      this.#handlers.delete(channel);
    }
  }

  /**
   * Cancela todos os listeners registrados por essa instância
   */
  clear() {
    for (const [channel, handler] of this.#handlers) {
      ipcMain.removeListener(channel, handler);
    }
    this.#handlers.clear();
  }
}

export default TinyIpcResponder;
