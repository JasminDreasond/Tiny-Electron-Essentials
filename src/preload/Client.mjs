import { ipcRenderer } from 'electron';
import TinyIpcRequestManager from './IpcRequestManager.mjs';

class TinyElectronClient {
  /** @type {TinyIpcRequestManager} */
  #ipcRequest;

  /**
   * Returns the internal TinyIpcRequestManager instance.
   * @returns {TinyIpcRequestManager}
   */
  getIpcRequest() {
    return this.#ipcRequest;
  }

  /**
   * @param {Object} [settings={}] - Configuration settings for the application.
   * @param {string} [settings.ipcReceiverChannel] - Custom ipc response channel name of TinyIpcResponder instance.
   *
   * @throws {Error} If any required string values are missing or invalid.
   */
  constructor({ ipcReceiverChannel } = {}) {
    this.#ipcRequest = new TinyIpcRequestManager(ipcReceiverChannel);

    ipcRenderer.on('console-message', (event, msg, msg2) => {
      console.log(msg, msg2);
    });
  }
}

export default TinyElectronClient;
