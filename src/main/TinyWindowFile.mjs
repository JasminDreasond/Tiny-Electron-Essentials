import fs from 'fs';
import { isJsonObject } from 'tiny-essentials';

/**
 * @typedef {{ width: number; height: number }} Bounds
 * An object representing the size of a window.
 */

/**
 * @typedef {{ bounds?: Bounds }} InitConfig
 * Optional configuration used to initialize a window entry.
 */

class TinyWindowFile {
  /** @type {Record<string, Bounds>} */
  #bounds = {};

  /** @type {Record<string, InitConfig>} */
  #ids = {};

  /**
   * Loads window configuration from a file and stores it internally.
   *
   * @param {string} initFile - The path to the JSON file containing window bounds.
   * @param {Object} [settings={}] - Optional settings to use if the file has no valid bounds.
   * @param {Bounds} [settings.bounds={ width: 1200, height: 700 }] - Default bounds if file has none.
   * @throws {TypeError} If `initFile` is not a string.
   * @throws {TypeError} If `settings.bounds` is not a valid Bounds object.
   */
  loadFile(initFile, { bounds = { width: 1200, height: 700 } } = {}) {
    if (typeof initFile !== 'string') throw new TypeError('Expected "initFile" to be a string.');

    if (
      !isJsonObject(bounds) ||
      typeof bounds.width !== 'number' ||
      typeof bounds.height !== 'number'
    )
      throw new TypeError('Expected "bounds" to be an object with numeric width and height.');

    /** @type {null|InitConfig} */
    let data = null;
    try {
      data = JSON.parse(fs.readFileSync(initFile, 'utf8'));
      if (!isJsonObject(data)) data = {};
    } catch {
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
   * Returns a complete configuration for a previously loaded window.
   *
   * @param {string} id - The ID or path used to load the window configuration.
   * @returns {InitConfig}
   * @throws {TypeError} If `id` is not a string.
   * @throws {Error} If `id` has not been registered.
   */
  getData(id) {
    if (typeof id !== 'string') throw new TypeError('Expected "id" to be a string.');
    if (!this.hasIndex(id)) throw new Error(`No configuration found for id "${id}".`);

    return {
      bounds: this.getBounds(id),
    };
  }

  /**
   * Checks if a configuration has been loaded for the given ID.
   *
   * @param {string} id - The ID or path to check.
   * @returns {boolean} True if a config exists, false otherwise.
   * @throws {TypeError} If `id` is not a string.
   */
  hasIndex(id) {
    if (typeof id !== 'string') throw new TypeError('Expected "id" to be a string.');
    return !!this.#ids[id];
  }

  /**
   * Returns the bounds for a previously loaded window.
   *
   * @param {string} id - The ID or path used to load the window configuration.
   * @returns {Bounds} A new copy of the bounds object.
   * @throws {TypeError} If `id` is not a string.
   * @throws {Error} If bounds are not found for the given ID.
   */
  getBounds(id) {
    if (typeof id !== 'string') throw new TypeError('Expected "id" to be a string.');

    const bounds = this.#bounds[id];
    if (!bounds) throw new Error(`No bounds found for id "${id}".`);

    return { ...bounds };
  }
}

export default TinyWindowFile;
