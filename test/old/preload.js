const { generateRandomMenu } = require('./utils');

win.addMenuButton('File', {
  position: 'left',
  items: [
    {
      label: 'New',
      onClick: () => console.log('New'),
    },
    {
      label: 'Open',
      onClick: () => console.log('Open'),
    },
    {
      label: 'Export',
      items: generateRandomMenu(),
    },
    {
      label: 'Import',
      items: generateRandomMenu(),
    },
    { label: 'Exit', onClick: () => client.quit() },
  ],
});
