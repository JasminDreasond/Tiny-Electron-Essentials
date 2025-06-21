/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */

/**
 * Default implementation of styleCreator
 *
 *  @typedef {() => { styleContent: string; html: string; }} DefaultStyleCreator
 */

/**
 * Generates loading screen HTML and corresponding styles.
 *
 * @typedef {Object} GetLoadingHtml
 * @property {string} [id='app-loading-style']
 * @property {string} [className='app-loading-wrap root-electron-style-solo']
 * @property {DefaultStyleCreator} [styleCreator=defaultLoadingStyleCreator]
 */

/** @type {DefaultStyleCreator} */
export function defaultLoadingStyleCreator() {
  const containerClass = 'container__loaders-css';
  const className = `loaders-css__square-spin`;

  const styleContent = `
  @keyframes square-spin {
    25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
    50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
    75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
    100% { transform: perspective(100px) rotateX(0) rotateY(0); }
  }

  .root-electron-style-solo {
    -webkit-app-region: drag;
  }

  .${className} .${containerClass} > div {
    animation-fill-mode: both;
    width: 50px;
    height: 50px;
    background: #fff;
    animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
  }
  .app-loading-wrap .${containerClass} {
    background: #282c34;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .app-loading-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    z-index: 9;
  }
  `;

  const html = `<div class="${className} root-electron-style-solo"><div class="${containerClass} root-electron-style-solo"><div></div></div></div>`;

  return { styleContent, html };
}

/**
 * Creates a transparent, non-interactive window overlay style.
 *
 * @returns {{ styleContent: string, html: string }}
 */
export function transparentOverlayStyle() {
  const styleContent = `
    .transparent-electron-window {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background-color: transparent;
      -webkit-user-select: none;
      z-index: 999999;
    }
    html, body, * {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
    }
  `;

  const html = `<div class="transparent-electron-window"></div>`;

  return { styleContent, html };
}

/**
 * Generates loading screen HTML and corresponding styles.
 *
 * @param {GetLoadingHtml} [settings={}]
 * @returns {{
 *   oStyle: HTMLStyleElement,
 *   oDiv: HTMLDivElement
 * }}
 *
 * @throws {TypeError} If styleCreator is not a function
 * @throws {Error} If styleCreator result is invalid
 * @throws {TypeError} If id or className are not strings
 */
export const getLoadingHtml = ({
  styleCreator = defaultLoadingStyleCreator,
  id = 'app-loading-style',
  className = 'app-loading-wrap root-electron-style-solo',
} = {}) => {
  if (typeof styleCreator !== 'function')
    throw new TypeError(`Expected 'styleCreator' to be a function, got ${typeof styleCreator}`);
  const result = styleCreator();
  if (
    typeof result !== 'object' ||
    result === null ||
    typeof result.styleContent !== 'string' ||
    typeof result.html !== 'string'
  )
    throw new Error(
      "The 'styleCreator' must return an object with 'styleContent' and 'html' strings.",
    );
  if (typeof id !== 'string') throw new TypeError(`Expected 'id' to be a string, got ${typeof id}`);
  if (typeof className !== 'string')
    throw new TypeError(`Expected 'className' to be a string, got ${typeof className}`);

  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = id;
  oStyle.innerHTML = result.styleContent;

  oDiv.className = className;
  oDiv.innerHTML = result.html;

  return { oStyle, oDiv };
};
