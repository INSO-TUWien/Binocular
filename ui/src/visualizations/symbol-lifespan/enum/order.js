class OrderVariant {
  constructor(value) {
    this.value = value;
  }
}

const NONE = new OrderVariant('none');
const ASCENDING = new OrderVariant('asc');
const DESCENDING = new OrderVariant('desc');

export const Order = {
  values: [NONE, ASCENDING, DESCENDING],
  NONE,
  ASCENDING,
  DESCENDING
};
