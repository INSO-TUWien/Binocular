export const formatInteger = (value) => (+value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
export const formatNumber = (value) => (+value).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
export const formatPercentage = (value) => (+value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
