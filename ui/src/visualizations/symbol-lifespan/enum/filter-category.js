import { InclusionFilter } from './inclusion-filter';
import { ExclusionFilter } from './exclusion-filter';

class FilterCategoryVariant {
  constructor(value, label, options) {
    this.value = value;
    this.label = label;
    this.options = options;
  }
}

const INCLUSION_FILTERS = new FilterCategoryVariant(
  'include',
  'With one of these types:',
  InclusionFilter
);
const EXCLUSION_FILTERS = new FilterCategoryVariant('exclude', 'Unless they are:', ExclusionFilter);

export const FilterCategory = {
  values: [INCLUSION_FILTERS, EXCLUSION_FILTERS],
  INCLUSION_FILTERS,
  EXCLUSION_FILTERS
};
