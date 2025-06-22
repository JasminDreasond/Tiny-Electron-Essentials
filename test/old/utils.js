/**
 * Generate a random menu list with nested submenus.
 *
 * @param {number} [maxDepth=3] - Maximum nesting depth.
 * @param {number} [maxItems=5] - Maximum number of items per level.
 * @returns {MenuDropdown[]} - Randomly generated menu.
 */

/**
 * @typedef {{
 *  label: string;
 *  onClick?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
 *  items?: MenuDropdown[];
 * }} MenuDropdown
 */

function generateRandomMenu(maxDepth = 3, maxItems = 5) {
  const formats = ['PNG', 'PDF', 'WEBP', 'ICO', 'SVG', 'JPG', 'GIF', 'TIFF', 'BMP'];
  let labelCounter = 1;

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFormat = () => formats[randomInt(0, formats.length - 1)];

  const createItems = (depth) => {
    const itemCount = randomInt(1, maxItems);
    const items = [];

    for (let i = 0; i < itemCount; i++) {
      const isSubmenu = depth < maxDepth && Math.random() < 0.5;

      const label = isSubmenu ? `More ${labelCounter++}` : `As ${randomFormat()} ${labelCounter++}`;

      const item = {
        label,
      };

      if (isSubmenu) {
        item.items = createItems(depth + 1);
      } else {
        item.onClick = () => console.log(label);
      }

      items.push(item);
    }

    return items;
  };

  // 🔥 Garante que a primeira camada sempre é uma lista de itens
  return createItems(1);
}

exports.generateRandomMenu = generateRandomMenu;
