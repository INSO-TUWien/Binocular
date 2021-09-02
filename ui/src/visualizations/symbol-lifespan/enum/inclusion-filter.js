class InclusionFilterVariant {
  constructor(value, label, ts) {
    this.value = value;
    this.label = label;
    this.ts = ts || false;
  }
}

const FUNCTION_NAME = new InclusionFilterVariant('function', 'Function name');
const CLASS_NAME = new InclusionFilterVariant('class', 'Class name');
const INTERFACE_NAME = new InclusionFilterVariant('interface', 'Interface name', true);
const ENUM_NAME = new InclusionFilterVariant('enum', 'Enum name', true);
const TYPE_ALIAS = new InclusionFilterVariant('alias', 'Type alias name', true);
const TYPE_PARAMETER = new InclusionFilterVariant('type', 'Type parameter', true);
const CLASS_MEMBER = new InclusionFilterVariant('static', 'Class member');
const INSTANCE_MEMBER = new InclusionFilterVariant('instance', 'Instance member');
const OBJECT_KEY = new InclusionFilterVariant('key', 'Plain object key');
const FUNCTION_PARAMETER = new InclusionFilterVariant('param', 'Function parameter');
const LOCAL_VARIABLE = new InclusionFilterVariant('local', 'Local variable');
const STATEMENT_LABEL = new InclusionFilterVariant('label', 'Statement label');
const IMPORT_ALIAS = new InclusionFilterVariant('import', 'Import alias');
const EXPORT_ALIAS = new InclusionFilterVariant('export', 'Export alias');
const MODULE_NAME = new InclusionFilterVariant('module', 'Ambient module name', true);

export const InclusionFilter = {
  values: [
    FUNCTION_NAME,
    CLASS_NAME,
    INTERFACE_NAME,
    ENUM_NAME,
    TYPE_ALIAS,
    TYPE_PARAMETER,
    CLASS_MEMBER,
    INSTANCE_MEMBER,
    OBJECT_KEY,
    FUNCTION_PARAMETER,
    LOCAL_VARIABLE,
    STATEMENT_LABEL,
    IMPORT_ALIAS,
    EXPORT_ALIAS,
    MODULE_NAME
  ],
  fromValue: value => InclusionFilter.values.find(c => c.value === value),
  FUNCTION_NAME,
  CLASS_NAME,
  INTERFACE_NAME,
  ENUM_NAME,
  TYPE_ALIAS,
  TYPE_PARAMETER,
  CLASS_MEMBER,
  INSTANCE_MEMBER,
  OBJECT_KEY,
  FUNCTION_PARAMETER,
  LOCAL_VARIABLE,
  STATEMENT_LABEL,
  IMPORT_ALIAS,
  EXPORT_ALIAS,
  MODULE_NAME
};
