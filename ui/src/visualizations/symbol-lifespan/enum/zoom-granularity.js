class ZoomGranularityVariant {
  constructor(value, label, unit) {
    this.value = value;
    this.label = label;
    this.unit = unit;
  }
}

const DAYS = new ZoomGranularityVariant('d', 'Days', 'days');
const WEEKS = new ZoomGranularityVariant('w', 'Weeks', 'weeks');
const MONTHS = new ZoomGranularityVariant('m', 'Months', 'months');

export const ZoomGranularity = {
  values: [DAYS, WEEKS, MONTHS],
  DAYS,
  WEEKS,
  MONTHS
};
