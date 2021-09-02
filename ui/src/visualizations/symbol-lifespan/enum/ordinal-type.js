class OrdinalTypeVariant {
  constructor(value, type, ascLabel, descLabel) {
    this.value = value;
    this.type = type;
    this.ascLabel = ascLabel;
    this.descLabel = descLabel;
  }
}

const NUMBER = new OrdinalTypeVariant('number', Number, 'Ascending', 'Descending');
const DATE = new OrdinalTypeVariant('date', Date, 'Oldest first', 'Newest first');

export const OrdinalType = {
  values: [NUMBER, DATE],
  NUMBER,
  DATE
};
