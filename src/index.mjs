const errorMessage =
  '[tiny-electron-essentials] This module must not be imported directly.\n' +
  'Please import from one of the following entry points instead:\n' +
  "  → 'tiny-electron-essentials/preload'\n" +
  "  → 'tiny-electron-essentials/main'\n" +
  "  → 'tiny-electron-essentials/global'\n\n" +
  "Direct imports like `import 'tiny-electron-essentials'` or `import something from 'tiny-electron-essentials'` are not supported.\n" +
  'This separation is necessary to avoid conflicts between Electron contexts (main, preload, renderer).';

// Side effect: always throw when imported
throw new Error(errorMessage);

/**
 * [tiny-electron-essentials] This module must not be imported directly.
 *
 * Please import from one of the following entry points instead:
 *   → 'tiny-electron-essentials/preload'
 *   → 'tiny-electron-essentials/main'
 *   → 'tiny-electron-essentials/global'
 *
 * Direct imports like `import 'tiny-electron-essentials'` or `import something from 'tiny-electron-essentials'` are not supported.
 * This separation is necessary to avoid conflicts between Electron contexts (main, preload, renderer).
 *
 * @returns {never}
 */
export default function () {
  throw new Error(errorMessage);
}
