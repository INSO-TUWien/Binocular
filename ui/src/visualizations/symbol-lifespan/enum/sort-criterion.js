import { Order } from './order';
import { OrdinalType } from './ordinal-type';

class SortCriterionVariant {
  constructor(value, label, defaultOrder, type) {
    this.value = value;
    this.label = label;
    this.order = defaultOrder;
    this.type = type;
  }
}

const RELEVANCE = new SortCriterionVariant(
  'relevance',
  'Relevance',
  Order.NONE,
  OrdinalType.NUMBER
);
const LIFESPAN = new SortCriterionVariant(
  'lifespan',
  'Lifespan length',
  Order.DESCENDING,
  OrdinalType.NUMBER
);
const DATE_ADDED = new SortCriterionVariant(
  'added',
  'Date added',
  Order.DESCENDING,
  OrdinalType.DATE
);
const DATE_REMOVED = new SortCriterionVariant(
  'removed',
  'Date removed',
  Order.DESCENDING,
  OrdinalType.DATE
);
const DATE_CHANGED = new SortCriterionVariant(
  'updated',
  'Date last changed',
  Order.DESCENDING,
  OrdinalType.DATE
);

export const SortCriterion = {
  values: [RELEVANCE, LIFESPAN, DATE_ADDED, DATE_REMOVED, DATE_CHANGED],
  fromValue: value => SortCriterion.values.find(c => c.value === value),
  RELEVANCE,
  LIFESPAN,
  DATE_ADDED,
  DATE_REMOVED,
  DATE_CHANGED
};
