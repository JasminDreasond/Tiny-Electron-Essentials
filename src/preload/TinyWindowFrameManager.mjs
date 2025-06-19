// @ts-nocheck
import { getDefaultWindowFrameRoot, getDefaultWindowFrameStyle } from '../global/CssFile.mjs';
import { RootEvents } from '../global/Events.mjs';
import { moveBodyContentTo } from '../global/Utils.mjs';
import TinyElectronClient from './TinyElectronClient.mjs';

class TinyWindowFrameManager {
  #windowRoot = 'window-root';
  #minimizeIcon = '🗕';
  #maximizeIcon = '🗖';
  #unmaximizeIcon = '🗗';
  #closeIcon = '🗙';

  #blurClass = 'electron-blur';
  #focusClass = 'electron-focus';
  #fullscreenClass = 'electron-fullscreen';
  #maximizedClass = 'electron-maximized';

  #client;
  #options = {
    buttonsPosition: 'right',
    titlePosition: 'center',
    buttonsMap: ['minimize', 'maximize', 'close'],
  };

  elements = {};
  styles = {};

  getElementName(name = '', extra = '', extra2 = '') {
    return `${extra2.length > 0 ? `${extra2} ` : ''}#${this.#windowRoot}${extra}${name.length > 0 && name.startsWith(' ') ? name : ` ${name}`}`;
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

    this.#createStructure();
    this.#applyDefaultStyles(applyDefaultStyles);
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

    btn.minimize.addEventListener('click', () => this.#client.minimize());
    btn.close.addEventListener('click', () => this.#client.close());
    btn.maximize.addEventListener('click', () =>
      this.#client.isMaximized() ? this.#client.unmaximize() : this.#client.maximize(),
    );

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
    if (window.innerHeight === screen.height && window.innerWidth === screen.width)
      document.body.classList.add(this.#fullscreenClass);
    if (document.hasFocus()) document.body.classList.add(this.#focusClass);
    else document.body.classList.add(this.#blurClass);

    client.on(RootEvents.IsFocused, (isFocused) => {
      if (isFocused) {
        document.body.classList.add(this.#focusClass);
        document.body.classList.remove(this.#blurClass);
      } else {
        document.body.classList.remove(this.#focusClass);
        document.body.classList.add(this.#blurClass);
      }
    });

    client.on(RootEvents.IsMaximized, (isMaximized) => {
      if (isMaximized) document.body.classList.add(this.#maximizedClass);
      else document.body.classList.remove(this.#maximizedClass);
    });

    client.on(RootEvents.IsFullScreen, (isFullScreen) => {
      if (isFullScreen) document.body.classList.add(this.#fullscreenClass);
      else document.body.classList.remove(this.#fullscreenClass);
    });

    // Check menu visibility initially
    this.#checkMenuVisibility();
  }

  #applyDefaultStyles(applyDefaultStyles = false) {
    const root = document.createElement('style');
    root.id = 'electron-window-root-style';
    root.textContent = getDefaultWindowFrameRoot();

    document.head.prepend(root);
    this.styles.root = root;
    if (!applyDefaultStyles) return;

    const style = document.createElement('style');
    style.id = 'electron-window-style';
    style.textContent = getDefaultWindowFrameStyle({
      getElementName: (className, extra, extra2) => this.getElementName(className, extra, extra2),
      fullscreenClass: this.#fullscreenClass,
      blurClass: this.#blurClass,
    });

    document.head.prepend(style);
    this.styles.default = style;
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
