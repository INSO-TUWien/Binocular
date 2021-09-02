class SubmenuVariant {
  constructor(value, label) {
    this.value = value;
    this.label = label;
  }
}

const NONE = new SubmenuVariant('none', null);
const SORT = new SubmenuVariant('sort', 'Sort');
const FILTER = new SubmenuVariant('filter', 'Filter');

export const Submenu = {
  values: [NONE, SORT, FILTER],
  NONE,
  SORT,
  FILTER
};
