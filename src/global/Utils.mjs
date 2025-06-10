/**
 * @typedef {Error & { code?: any, data?: any }} ErrorParsed
 */

/**
 * @param {ErrorParsed} error
 * @returns {{
 *   name: string,
 *   message: string,
 *   stack?: string,
 *   code?: any,
 *   data?: any
 * }}
 * @throws {Error}
 */
export function serializeError(error) {
  if (typeof error !== 'object' || error === null)
    throw new Error('Expected error to be a non-null object');
  if (typeof error.name !== 'string') throw new Error('Expected error.name to be a string');
  if (typeof error.message !== 'string') throw new Error('Expected error.message to be a string');
  if (error.stack !== undefined && typeof error.stack !== 'string')
    throw new Error('Expected error.stack to be a string if defined');

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error.code !== undefined && { code: error.code }),
    ...(error.data !== undefined && { data: error.data }),
  };
}

/**
 * @param {{
 *   name?: string,
 *   message: string,
 *   stack?: string,
 *   code?: any,
 *   data?: any
 * }} json
 * @returns {ErrorParsed}
 * @throws {Error}
 */
export function deserializeError(json) {
  if (typeof json !== 'object' || json === null)
    throw new Error('Expected json to be a non-null object');
  if (typeof json.message !== 'string') throw new Error('Expected json.message to be a string');
  if (json.name !== undefined && typeof json.name !== 'string')
    throw new Error('Expected json.name to be a string if defined');
  if (json.stack !== undefined && typeof json.stack !== 'string')
    throw new Error('Expected json.stack to be a string if defined');

  /** @type {ErrorParsed} */
  const error = new Error(json.message);
  error.name = json.name || 'Error';
  error.stack = json.stack || '';
  if (json.code !== undefined) error.code = json.code;
  if (json.data !== undefined) error.data = json.data;
  return error;
}

/**
 * @param {*} obj
 * @returns {*}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(deepClone);
  if (obj instanceof Object) {
    const copy = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // @ts-ignore
        copy[key] = deepClone(obj[key]);
      }
    }
    return copy;
  }

  throw new Error('Unsupported type');
}
