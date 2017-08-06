const blessed = require('blessed');

const STYLES = {
  top: 'top',
  left: 'left',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    border: {
      fg: '#f0f0f0'
    }
  }
};

const QUIT_KEYS = ['escape', 'q', 'C-c'];

module.exports = class GUI {
  constructor(options = {}) {
    this.fiatCurrencySymbol = options.fiatCurrencySymbol;
    this.headers = options.columns.map(column => column[0]);

    const screen = this.screen = blessed.screen({
      smartCSR: true
    });

    screen.title = options.title;

    const table = this.table = blessed.table(STYLES);
    screen.append(table);

    // Quit on Escape, q, or Control-C.
    screen.key(QUIT_KEYS, function(ch, key) {
      return process.exit(0);
    });

    screen.render();
  }

  update(rows){
    this.table.setData(
      [].concat([this.headers]).concat(rows)
    );

    this.table.focus();
    this.screen.render();
  }
};

/* private */

const priceHeader = (fiatCurrencySymbol) => {
  if (!fiatCurrencySymbol) return PRICE;
  return `${PRICE} (${fiatCurrencySymbol})`;
}
