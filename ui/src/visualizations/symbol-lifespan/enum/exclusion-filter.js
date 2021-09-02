class ExclusionFilterVariant {
  constructor(value, label, ts) {
    this.value = value;
    this.label = label;
    this.ts = ts || false;
  }
}

const GLOBAL_VARIABLE = new ExclusionFilterVariant('global', 'Global variables');
const READONLY = new ExclusionFilterVariant('readonly', 'Readonly', true);
const LAMBDA = new ExclusionFilterVariant('lambda', 'Lambda parameters');
const LOOP_VARIABLE = new ExclusionFilterVariant('loop', 'Loop variables');
const SHORT = new ExclusionFilterVariant('short', 'Single-letter variables');

export const ExclusionFilter = {
  values: [GLOBAL_VARIABLE, READONLY, LAMBDA, LOOP_VARIABLE, SHORT],
  fromValue: value => ExclusionFilter.values.find(c => c.value === value),
  GLOBAL_VARIABLE,
  READONLY,
  LAMBDA,
  LOOP_VARIABLE,
  SHORT
};
