// @ts-nocheck
import { RootEvents } from '../global/Events.mjs';
import { moveBodyContentTo } from '../global/Utils.mjs';
import TinyElectronClient from './TinyElectronClient.mjs';

class TinyWindowFrameManager {
  #windowRoot = 'window-root';
  #minimizeIcon = '🗕';
  #maximizeIcon = '🗖';
  #unmaximizeIcon = '🗗';
  #closeIcon = '🗙';

  #client;
  #options = {
    buttonsPosition: 'right',
    titlePosition: 'center',
    buttonsMap: ['minimize', 'maximize', 'close'],
  };

  getElementName(name = '') {
    return `#${this.#windowRoot}${name.length > 0 && name.startsWith(' ') ? name : ` ${name}`}`;
  }

  /**
   * @param {Object} [options]
   * @param {boolean} [options.applyDefaultStyles=true]
   * @param {'left'|'right'} [options.buttonsPosition='right']
   * @param {'left'|'center'|'right'} [options.titlePosition='center']
   * @param {string[]} [options.buttonsMap=['minimize', 'maximize', 'close']]
   * @param {TinyElectronClient} [options.client]
   */
  constructor({
    applyDefaultStyles = true,
    buttonsPosition = 'right',
    titlePosition = 'center',
    buttonsMap = ['minimize', 'maximize', 'close'],
    client,
  } = {}) {
    this.#options.buttonsPosition = buttonsPosition;
    this.#options.titlePosition = titlePosition;
    this.#options.buttonsMap = buttonsMap;
    this.#client = client;

    this.elements = {};
    this.styles = {};

    this.#createStructure();
    if (applyDefaultStyles) this.#applyDefaultStyles();
  }

  #createStructure() {
    const root = document.createElement('div');
    root.id = this.#windowRoot;

    const frame = document.createElement('div');
    frame.classList.add('custom-window-frame');

    const content = document.createElement('div');
    content.classList.add('window-content');

    const rootContent = document.createElement('div');
    rootContent.id = 'root';
    content.prepend(rootContent);

    // Top bar
    const top = document.createElement('div');
    top.classList.add('frame-top');

    // Subcontainers
    const topLeft = document.createElement('div');
    topLeft.classList.add('frame-top-left');

    const topCenter = document.createElement('div');
    topCenter.classList.add('frame-top-center');

    const topRight = document.createElement('div');
    topRight.classList.add('frame-top-right');

    // Menu
    const menuRight = document.createElement('div');
    menuRight.classList.add('frame-menu');
    const menuLeft = document.createElement('div');
    menuLeft.classList.add('frame-menu');

    // Icon
    const icon = document.createElement('div');
    icon.classList.add('frame-icon');

    // Title
    const title = document.createElement('div');
    title.classList.add('frame-title');
    title.textContent = 'Application Title';

    // Buttons
    const buttons = document.createElement('div');
    const btn = {
      maximize: document.createElement('button'),
      minimize: document.createElement('button'),
      close: document.createElement('button'),
    };

    btn.minimize.classList.add('btn-minimize');
    btn.minimize.innerHTML = this.#minimizeIcon;

    btn.maximize.classList.add('btn-maximize');
    btn.maximize.innerHTML = this.#maximizeIcon;

    btn.close.classList.add('btn-close');
    btn.close.innerHTML = this.#closeIcon;

    buttons.classList.add('frame-buttons');
    for (const value of this.#options.buttonsMap) {
      if (btn[value] instanceof HTMLElement) buttons.appendChild(btn[value]);
      else throw new Error('');
    }

    // Build top sections respecting icon always at the end
    const buildSection = (side, items) => {
      const section = side === 'left' ? topLeft : topRight;
      items.forEach((item) => {
        if (item !== null) {
          if (item === 'icon') section.appendChild(icon);
          else section.appendChild(item);
        }
      });

      return section;
    };

    buildSection('left', [
      'icon',
      this.#options.titlePosition === 'left' ? title : null,
      buttons,
      menuLeft,
    ]);
    buildSection('right', [
      menuRight,
      this.#options.titlePosition === 'right' ? title : null,
      buttons,
    ]);
    if (this.#options.titlePosition === 'center') topCenter.appendChild(title);

    top.append(topLeft, topCenter, topRight);

    frame.append(top);

    root.append(frame, content);
    moveBodyContentTo(rootContent);
    document.body.prepend(root);

    this.elements = {
      rootContent,
      root,
      frame,
      top,
      menuLeft,
      menuRight,
      icon,
      title,
      topLeft,
      topCenter,
      topRight,
      buttons: {
        root: buttons,
        ...btn,
      },
    };

    const client = this.#client;

    client.on(RootEvents.IsFocused, (isFocused) => {
      if (isFocused) {
        document.body.classList.add('electron-focus');
        document.body.classList.remove('electron-blur');
      } else {
        document.body.classList.remove('electron-focus');
        document.body.classList.add('electron-blur');
      }
    });

    client.on(RootEvents.IsMaximized, (isMaximized) => {
      if (isMaximized) document.body.classList.add('electron-maximized');
      else document.body.classList.remove('electron-maximized');
    });

    client.on(RootEvents.IsFullScreen, (isFullScreen) => {
      if (isFullScreen) document.body.classList.add('electron-fullscreen');
      else document.body.classList.remove('electron-fullscreen');
    });

    // Check menu visibility initially
    this.#checkMenuVisibility();
  }

  #applyDefaultStyles() {
    const root = document.createElement('style');
    root.id = 'electron-window-root-style';
    root.textContent = `
      :root ${this.getElementName()} {
        /* Layout */
        --frame-root-background: #fff;
        --frame-height: 32px;
        --frame-border-size: 1px;

        /* Colors */
        --frame-background: rgba(30, 30, 30, 0.95);
        --frame-border-color: rgb(76 76 76);
        --frame-border-radius: 7px;

        /* Text */
        --frame-font-size: 10pt;
        --frame-font-family: system-ui, sans-serif;
        --frame-title-font-size: 8pt;
        --frame-font-color: white;
        --frame-button-color: white;
        --frame-button-hover-background: rgba(255, 255, 255, 0.1);

        /* Icons */
        --frame-icon-size: 20px;

        /* Buttons */
        --frame-button-width: 32px;

        /* Padding */
        --frame-padding-x: 8px;
        --frame-gap: 6px;

        /* Menu */
        --frame-menu-max-width: 200px;
        --frame-menu-gap: 4px;
      }
    `;

    const style = document.createElement('style');
    style.id = 'electron-window-style';
    style.textContent = `
      ${this.getElementName()} {
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      ${this.getElementName('.custom-window-frame')} {
        pointer-events: none;
        user-select: none;
        color: var(--frame-font-color);
        border-top: var(--frame-border-size) solid var(--frame-border-color);
        border-left: var(--frame-border-size) solid var(--frame-border-color);
        border-right: var(--frame-border-size) solid var(--frame-border-color);
      }

      ${this.getElementName('.custom-window-frame')},
      ${this.getElementName('.frame-top')} {
        border-top-left-radius: var(--frame-border-radius);
        border-top-right-radius: var(--frame-border-radius);
      }

      ${this.getElementName('.frame-top-left')} {
        border-top-left-radius: var(--frame-border-radius);
      }

      ${this.getElementName('.frame-top-right')} {
        border-top-right-radius: var(--frame-border-radius);
      }

      ${this.getElementName('.window-content')} {
        flex: 1;
        overflow: auto;
        pointer-events: all;
        background: var(--frame-root-background);
        border-bottom: var(--frame-border-size) solid var(--frame-border-color);
        border-left: var(--frame-border-size) solid var(--frame-border-color);
        border-right: var(--frame-border-size) solid var(--frame-border-color);
        border-bottom-left-radius: var(--frame-border-radius);
        border-bottom-right-radius: var(--frame-border-radius);
      }

      ${this.getElementName('.frame-top')} {
        position: relative;
        width: 100%;
        height: var(--frame-height);
        display: flex;
        background: var(--frame-background);
        pointer-events: all;
        -webkit-app-region: drag;
      }

      ${this.getElementName('.frame-top-left')},
      ${this.getElementName('.frame-top-center')},
      ${this.getElementName('.frame-top-right')} {
        display: flex;
        align-items: center;
        gap: var(--frame-gap);
      }

      ${this.getElementName('.frame-top-left')},
      ${this.getElementName('.frame-top-right')} {
        flex: 0 0 auto;
        padding-top: 0px;
        padding-bottom: 0px;
      }

      ${this.getElementName('.frame-top-left')} {
        padding-right: var(--frame-padding-x);
      }
      ${this.getElementName('.frame-top-right')} {
        padding-left: var(--frame-padding-x);
      }

      ${this.getElementName('.frame-top-center')} {
        flex: 1;
        justify-content: center;
        padding: 0 var(--frame-padding-x);
        overflow: hidden;
      }

      ${this.getElementName('.frame-title')} {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: var(--frame-title-font-size);
        font-family: var(--frame-font-family);
      }

      ${this.getElementName('.frame-icon')} {
        padding-left: var(--frame-padding-x);
        width: var(--frame-icon-size);
        height: var(--frame-icon-size);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }

      ${this.getElementName('.frame-menu button')} {
        font-size: var(--frame-font-size);
        font-family: var(--frame-font-family);
        background-color: transparent;
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: default;
      }

      ${this.getElementName('.frame-buttons')} {
        height: 100%;
      }

      ${this.getElementName('.frame-buttons button')} {
        font-size: var(--frame-font-size);
        font-family: var(--frame-font-family);
        background: transparent;
        border: none;
        color: var(--frame-button-color);
        width: var(--frame-button-width);
        height: 100%;
        cursor: default;
        -webkit-app-region: no-drag;
      }

      ${this.getElementName('.frame-buttons button:hover')},
      ${this.getElementName('.frame-menu button:hover')} {
        background-color: var(--frame-button-hover-background);
      }

      ${this.getElementName('.frame-menu')} {
        max-width: var(--frame-menu-max-width);
        overflow-x: auto;
        display: flex;
        gap: var(--frame-menu-gap);
        -webkit-app-region: no-drag;
      }
    `;
    document.head.prepend(style);
    document.head.prepend(root);
    this.styles.default = style;
    this.styles.root = root;
  }

  /** 🔥 Internal to update menu visibility */
  #checkMenuVisibility() {
    const menuRight = this.elements.menuRight;
    menuRight.style.display = menuRight.children.length === 0 ? 'none' : 'flex';
    const menuLeft = this.elements.menuLeft;
    menuLeft.style.display = menuLeft.children.length === 0 ? 'none' : 'flex';
  }

  /** ✅ Content container */
  get content() {
    return this.elements.rootContent;
  }

  /** ✅ Add any custom HTMLElement to menu */
  addMenuCustomElement(element) {
    this.elements.menu.appendChild(element);
    this.#checkMenuVisibility();
  }

  showMenu(position = 'left') {
    const menu =
      position === 'left'
        ? this.elements.menuLeft
        : position === 'right'
          ? this.elements.menuRight
          : null;
    menu.classList.remove('menu-fade-out');
    menu.classList.add('menu-fade-in');
    menu.style.display = 'flex';
  }

  hideMenu(position = 'left') {
    const menu =
      position === 'left'
        ? this.elements.menuLeft
        : position === 'right'
          ? this.elements.menuRight
          : null;
    menu.classList.remove('menu-fade-in');
    menu.classList.add('menu-fade-out');
    setTimeout(() => {
      menu.style.display = 'none';
    }, 200);
  }

  /** ✅ Get menu DOM element */
  getMenuElement(position = 'left') {
    const menu =
      position === 'left'
        ? this.elements.menuLeft
        : position === 'right'
          ? this.elements.menuRight
          : null;
    return menu;
  }

  /** ✅ Add a button to the menu bar */
  addMenuButton(label, { onClick, position = 'left', id = null } = {}) {
    const btn = document.createElement('button');
    btn.textContent = label;
    if (id) btn.dataset.menuId = id;

    btn.onclick = onClick;
    if (position === 'left') this.elements.menuLeft.appendChild(btn);
    if (position === 'right') this.elements.menuRight.appendChild(btn);
    this.#checkMenuVisibility();
    return btn;
  }

  removeMenuButton(idOrElement) {
    const menu = this.elements.menu;
    if (typeof idOrElement === 'string') {
      const el = menu.querySelector(`[data-menu-id="${idOrElement}"]`);
      if (el) el.remove();
    } else if (idOrElement instanceof HTMLElement) {
      menu.contains(idOrElement) && idOrElement.remove();
    }
    this.#checkMenuVisibility();
  }

  /** ✅ Remove all menu buttons */
  clearMenu() {
    this.elements.menu.innerHTML = '';
    this.#checkMenuVisibility();
  }

  /** ✅ Change the window title */
  setTitle(text) {
    this.elements.title.textContent = text;
  }

  /** ✅ Set or change the window icon */
  setIcon(url) {
    this.elements.icon.style.backgroundImage = url ? `url(${url})` : '';
  }

  /** ✅ Apply custom CSS */
  applyCustomStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  }
}

export default TinyWindowFrameManager;
