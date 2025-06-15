/**
 * An extended error object that may contain additional metadata.
 *
 * @typedef {Error & {
 *   code?: any,   // Optional error code, any type.
 *   data?: any    // Optional additional error data.
 * }} ErrorParsed
 */

/**
 * Converts an `Error` object into a plain JSON-serializable object.
 * Useful for sending errors between processes or over the network.
 *
 * @param {ErrorParsed} error - The error object to serialize.
 * @returns {{
 *   name: string,          // Error name (e.g., 'TypeError')
 *   message: string,       // Error message
 *   stack?: string,        // Optional stack trace
 *   code?: any,            // Optional error code
 *   data?: any             // Optional additional error data
 * }}
 * @throws {Error} Throws if the input is not a valid error object.
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
 * Converts a plain JSON object back into an `Error` instance.
 * Useful for reconstructing errors received over IPC or network.
 *
 * @param {{
 *   name?: string,        // Optional error name (defaults to 'Error')
 *   message: string,      // Error message
 *   stack?: string,       // Optional stack trace
 *   code?: any,           // Optional error code
 *   data?: any            // Optional additional error data
 * }} json - The JSON object representing the error.
 * @returns {ErrorParsed} The reconstructed error object.
 * @throws {Error} Throws if the input JSON does not match the expected structure.
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
 * Performs a deep clone of an object, array, or date.
 * Useful for creating fully independent copies of nested structures.
 *
 * @param {*} obj - The object to clone. Supports plain objects, arrays, and Date instances.
 * @returns {*} A deep-cloned copy of the input.
 * @throws {Error} Throws if the input type is not supported (e.g., functions, Map, Set).
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
