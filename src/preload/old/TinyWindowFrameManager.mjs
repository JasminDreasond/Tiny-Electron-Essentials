// @ts-nocheck

/**
 * @typedef {Object} MenuDropdown
 * @property {string} label - The text label displayed for this menu item.
 * @property {(this: GlobalEventHandlers, ev: MouseEvent) => any} [onClick] -
 * The function to execute when this item is clicked. Optional if 'items' is provided.
 * @property {MenuDropdown[]} [items] -
 * A list of child menu items for creating submenus.
 * If provided, this item becomes a parent to a nested dropdown.
 */

class TinyWindowFrameManager {
  /**
   * Add a button to the menu bar with optional dropdown and submenus.
   *
   * @param {string} label - The text label of the button.
   * @param {Object} [settings={}] - Button settings.
   * @param {(this: GlobalEventHandlers, ev: MouseEvent) => any} [settings.onClick] - Click event handler for the button.
   * @param {'left'|'right'} [settings.position='left'] - Menu position where the button will be placed.
   * @param {string} [settings.id] - Optional identifier.
   * @param {number} [settings.dropdownHideTimeout=400] - Dropdown auto hide timeout.
   * @param {MenuDropdown[]} [settings.items] - Dropdown items or submenus.
   * @returns {HTMLButtonElement} - The created button element.
   * @throws {TypeError} If label is not a string.
   * @throws {TypeError} If onClick is not a function.
   * @throws {Error} If position is invalid.
   */
  addMenuButton(label, { onClick, position = 'left', id, items, dropdownHideTimeout = 400 } = {}) {
    if (typeof label !== 'string' || !label.trim())
      throw new TypeError(`Label must be a non-empty string. Received: ${label}`);

    // Prepare data
    const menu = this.getMenuElement(position);
    const btn = document.createElement('button');
    btn.classList.add('menu-button');
    btn.textContent = label;
    if (id) btn.dataset.menuId = id;

    // Has dropdown
    if (Array.isArray(items) && items.length > 0) {
      const { dropdown, closeDropdown } = this.createDropdown({
        direction: position,
        hideTimeout: dropdownHideTimeout,
        onClose: () => updateDropdown(false),
        items,
      });

      btn.classList.add('has-dropdown');
      btn.appendChild(dropdown);

      /** @param {boolean} isVisible */
      const updateDropdown = (isVisible) => {
        if (!dropdown) return;
        const bounds = dropdown.getBoundingClientRect();
        // const absoluteTop = bounds.top + window.scrollY;
        const absoluteLeft = bounds.left + window.scrollX;
        dropdown.style.left = isVisible ? `${absoluteLeft - 10}px` : '';
        if (isVisible) {
          btn.classList.add('active');
          dropdown.style.left = `${absoluteLeft - 10}px`;
        } else {
          dropdown.style.left = '';
          btn.classList.remove('active');
        }
      };

      // Button click
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!dropdown) return;
        const isVisible = dropdown.style.display === 'flex';
        document.querySelectorAll('.menu-dropdown').forEach((d) => {
          if (d instanceof HTMLElement) d.style.display = 'none';
        });
        dropdown.style.display = isVisible ? 'none' : 'flex';
        updateDropdown(!isVisible);
      });

      document.addEventListener('click', () => {
        closeDropdown();
        updateDropdown(false);
      });
    }

    // Simple click
    else if (typeof onClick === 'function') btn.onclick = onClick;
    // Nothing
    else throw new TypeError(`onClick must be a function if no dropdown items are provided.`);

    // Complete
    menu.appendChild(btn);
    this.#checkMenuVisibility();
    return btn;
  }

  /**
   * Internal: Create a dropdown container.
   *
   * @param {Object} [settings={}] - Dropdown settings.
   * @param {() => void} [settings.onClose] - Dropdown onClose.
   * @param {MenuDropdown[]} [settings.items] - List of items or submenus.
   * @param {'left'|'right'} [settings.direction] - Dropdown opening direction.
   * @param {number} [settings.hideTimeout=400] - Dropdown auto hide timeout.
   * @param {number} [settings.layer=1] - Dropdown layer.
   * @param {() => number} [settings.topBase=() => 0] - Dropdown height base.
   * @param {(() => void)|null} [settings.secondCloseDropdown=null] - Second dropdown closer.
   * @returns {{ dropdown: HTMLDivElement; closeDropdown: () => void }}
   */
  createDropdown({
    items,
    onClose,
    direction = 'right',
    hideTimeout = 400,
    layer = 1,
    topBase = () => 0,
    secondCloseDropdown = null,
  } = {}) {
    // Validate direction
    if (direction !== 'left' && direction !== 'right')
      throw new TypeError(`Invalid direction "${direction}". Expected "left" or "right".`);

    // Validate hideTimeout
    if (typeof hideTimeout !== 'number' || !Number.isFinite(hideTimeout) || hideTimeout < 0)
      throw new TypeError(`"hideTimeout" must be a non-negative number.`);

    // Validate secondCloseDropdown
    if (secondCloseDropdown !== null && typeof secondCloseDropdown !== 'function')
      throw new TypeError(`"secondCloseDropdown" must be a function or null.`);

    // Validate items
    if (!Array.isArray(items))
      throw new TypeError(`"items" must be an array of MenuDropdown objects.`);

    const dropdown = document.createElement('div');
    dropdown.classList.add('menu-dropdown');
    if (typeof secondCloseDropdown === 'function') dropdown.classList.add('sub-menu-dropdown');
    dropdown.style.flexDirection = 'column';
    dropdown.style.display = 'none';

    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';

    /** @type {{ exec: (() => void)|null, index: number }} */
    const stopOtherSubDropdown = { exec: null, index: -1 };

    /** @type {(() => void)[]} */
    const closesDropdown = [];
    const closeDropdown = () => {
      if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.style.left = '';
      }
      for (const callback of closesDropdown) callback();
      if (typeof secondCloseDropdown === 'function') secondCloseDropdown();
      if (typeof onClose === 'function') onClose();
    };

    // Items list
    items.forEach((item, index) => {
      if (typeof item !== 'object' || !item.label) return;

      const el = document.createElement('button');
      el.textContent = item.label;
      el.classList.add('menu-item');
      el.classList.add(`layer-${layer}`);

      // More items
      if (Array.isArray(item.items) && item.items.length > 0) {
        const { dropdown: subDropdown, closeDropdown: closeSubDropdown } = this.createDropdown({
          secondCloseDropdown: closeDropdown,
          topBase: () => {
            const elBounds = el.getBoundingClientRect();
            return elBounds.top + elBounds.height;
          },
          layer: layer + 1,
          items: item.items,
          direction,
          hideTimeout,
        });

        el.classList.add('has-submenu');
        if (typeof secondCloseDropdown === 'function') el.classList.add('sub-has-submenu');
        el.appendChild(subDropdown);

        // Menu event click

        /**
         * @param {boolean} isVisible
         * @param {boolean} [isSpecial]
         */
        const updateDropdown = (isVisible, isSpecial = false) => {
          if (!subDropdown) return;
          const dropdownBounds = dropdown.getBoundingClientRect();
          const elBounds = el.getBoundingClientRect();
          const executeSpecial = () => {
            if (isSpecial || !stopOtherSubDropdown.exec || stopOtherSubDropdown.index === index)
              return;
            stopOtherSubDropdown.exec();
          };

          if (isVisible) {
            subDropdown.style.left = `${dropdownBounds.width - 2}px`;
            const base = layer <= 1 ? 0 : Number(topBase() / 2) - Number(10 * layer);
            subDropdown.style.top = `${elBounds.top - base - elBounds.height - 10}px`;
            executeSpecial();
            stopOtherSubDropdown.exec = () => hideDropdown(true);
            stopOtherSubDropdown.index = index;
          } else {
            subDropdown.style.left = '';
            subDropdown.style.top = '';
            executeSpecial();
            stopOtherSubDropdown.index = -1;
            stopOtherSubDropdown.exec = null;
          }
        };

        closesDropdown.push(() => updateDropdown(false));

        /** @type {NodeJS.Timeout|null} */
        let hideTimeoutFunc = null;
        const clearHideTimeout = () => {
          if (hideTimeoutFunc) {
            clearTimeout(hideTimeoutFunc);
            hideTimeoutFunc = null;
          }
        };

        /** @param {boolean} [isSpecial] */
        const hideDropdown = (isSpecial = false) => {
          if (stopOtherSubDropdown.index !== -1 && stopOtherSubDropdown.index !== index) return;
          if (subDropdown) subDropdown.style.display = 'none';
          updateDropdown(false, isSpecial);
        };

        el.addEventListener('click', (e) => e.stopPropagation());
        el.addEventListener('mouseenter', () => {
          clearHideTimeout();
          subDropdown.style.display = 'flex';
          updateDropdown(true);
        });

        el.addEventListener('mouseleave', (e) => {
          // Check if mouse leaves both the main item and the dropdown itself
          const toElement = e.relatedTarget;
          clearHideTimeout();
          // @ts-ignore
          if (!subDropdown.contains(toElement) && toElement !== el) {
            hideTimeoutFunc = setTimeout(() => hideDropdown(), hideTimeout);
          }
        });

        subDropdown.addEventListener('mouseenter', () => clearHideTimeout());

        subDropdown.addEventListener('mouseleave', (e) => {
          const toElement = e.relatedTarget;
          clearHideTimeout();
          // @ts-ignore
          if (!el.contains(toElement) && !subDropdown.contains(toElement)) {
            hideTimeoutFunc = setTimeout(() => hideDropdown(), hideTimeout);
          }
        });

        document.addEventListener('click', () => {
          closeSubDropdown();
          updateDropdown(false);
        });
      }

      // Single event click
      else if (typeof item.onClick === 'function') {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          // @ts-ignore
          item.onClick(e);
          closeDropdown();
        });
      }

      // Complete
      dropdown.appendChild(el);
    });

    // Complete
    return { dropdown, closeDropdown };
  }
}
