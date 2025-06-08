import fs from 'fs';
import { isJsonObject } from 'tiny-essentials';

/**
 * @typedef {{ width: number; height: number;  }} Bounds
 */

/**
 * @typedef {{
 *  bounds?: Bounds
 * }} InitConfig
 */

class TinyWindowFile {
  /** @type {Record<string, Bounds>} */
  #bounds = {};

  /** @type {Record<string, InitConfig>} */
  #ids = {};

  /**
   * @param {string} initFile
   * @param {Object} [settings={}]
   * @param {Bounds} [settings.bounds={ width: 1200, height: 700 }]
   */
  loadFile(initFile, { bounds = { width: 1200, height: 700 } } = {}) {
    /** @type {null|InitConfig} */
    let data = null;
    try {
      data = JSON.parse(fs.readFileSync(initFile, 'utf8'));
      if (!isJsonObject(data)) data = {};
    } catch (e) {
      data = {};
    }

    // Bounds
    const dBounds =
      isJsonObject(data.bounds) &&
      typeof data.bounds.width === 'number' &&
      typeof data.bounds.height === 'number'
        ? { width: data.bounds.width, height: data.bounds.height }
        : bounds;

    this.#bounds[initFile] = dBounds;
    this.#ids[initFile] = { bounds: dBounds };
  }

  /**
   * @param {string} id
   * @returns {InitConfig}
   */
  getData(id) {
    return {
      bounds: this.getBounds(id),
    };
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  hasIndex(id) {
    return this.#ids[id] ? true : false;
  }

  /**
   * @param {string} id
   * @returns {Bounds}
   */
  getBounds(id) {
    return { ...this.#bounds[id] };
  }
}

export default TinyWindowFile;
