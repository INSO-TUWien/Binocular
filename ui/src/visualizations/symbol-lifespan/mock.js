export class Mock {
  static searchResults(n, eventProbability) {
    const items = [];
    const minDate = this.date(new Date(2020, 9, 1));
    const maxDate = this.date(new Date(2020, 11, 31));
    for (let i = 0; i < n; i++) {
      const symbol = this.symbol(minDate, maxDate);
      const postStart = this.datePlusDays(symbol.start, 1);
      const preEnd = this.datePlusDays(symbol.end, -1);
      for (let d = postStart; +d <= +preEnd; d = this.datePlusDays(d, 1)) {
        if (this.chance(eventProbability)) {
          symbol.events.push(this.event(d));
        }
      }
      items.push(symbol);
    }
    return items;
  }

  static event(date) {
    const eventTypes = ['rename', 'move', 'change'];
    return {
      date,
      type: this.randElement(eventTypes)
    };
  }

  static symbol(minDate, maxDate) {
    const mid = (+maxDate - +minDate) / 2;
    const symbolTypes = ['instance', 'class'];
    const symbol = this.randChars(3) + 'Loader';
    const type = this.randElement(symbolTypes);
    const scope = 'LoadersGroup';
    const file = 'src/components/loaders/LoadersGroup.js';
    const start = this.date(new Date(this.randInt(+minDate, +maxDate - mid)));
    const end = this.date(new Date(this.randInt(+minDate + mid, +maxDate)));
    return {
      symbol,
      type,
      scope,
      file,
      start,
      end,
      events: []
    };
  }

  static chance(p) {
    return p > Math.random();
  }

  static randInt(a, b) {
    return (b ? a : 0) + Math.floor(Math.random() * (b ? b - a : a));
  }

  static randElement(c) {
    return c[this.randInt(c.length)];
  }

  static randChars(n) {
    const randChar = () => String.fromCharCode(this.randInt(97, 97 + 26));
    let result = '';
    for (let i = 0; i < n; i++) {
      result += randChar();
    }
    return result;
  }

  static date(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  }

  static now() {
    return this.date(new Date());
  }

  static datePlusDays(d, days) {
    const result = new Date(d);
    result.setDate(d.getDate() + days);
    return this.date(result);
  }
}
