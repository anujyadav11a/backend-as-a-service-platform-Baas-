const sqlTypeRegex = /^(VARCHAR|CHAR|TEXT|TINYTEXT|MEDIUMTEXT|LONGTEXT|TINYINT|SMALLINT|MEDIUMINT|INT|INTEGER|BIGINT|DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|DATE|TIME|DATETIME|TIMESTAMP|YEAR|BINARY|VARBINARY|BLOB|TINYBLOB|MEDIUMBLOB|LONGBLOB|JSON|BOOLEAN|BOOL|ENUM|SET)(\(\d+(,\d+)?\))?$/i;

export const ATTRIBUTE_VALIDATION = {
  name: {
    required: 'Attribute name is required',
    maxLength: { value: 64, message: 'Attribute name cannot exceed 64 characters' },
    pattern: {
      value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      message: 'Attribute name must start with a letter or underscore and contain only letters, numbers, and underscores',
    },
  },
  type: {
    required: 'Data type is required',
    pattern: {
      value: sqlTypeRegex,
      message: 'Invalid SQL data type. Examples: VARCHAR(255), INT, TEXT, BOOLEAN, DECIMAL(10,2), ENUM(\'a\',\'b\')',
    },
  },
  required: {
    type: 'boolean',
  },
};

export const ATTRIBUTE_TYPES = [
  { label: 'String Types', options: [
    { value: 'VARCHAR(255)', label: 'VARCHAR(255) - Short text' },
    { value: 'VARCHAR(500)', label: 'VARCHAR(500) - Medium text' },
    { value: 'TEXT', label: 'TEXT - Long text' },
    { value: 'CHAR(36)', label: 'CHAR(36) - Fixed length (UUID)' },
  ]},
  { label: 'Numeric Types', options: [
    { value: 'INT', label: 'INT - Integer' },
    { value: 'BIGINT', label: 'BIGINT - Large integer' },
    { value: 'DECIMAL(10,2)', label: 'DECIMAL(10,2) - Decimal (price)' },
    { value: 'FLOAT', label: 'FLOAT - Floating point' },
    { value: 'DOUBLE', label: 'DOUBLE - Double precision' },
    { value: 'TINYINT', label: 'TINYINT - Small integer (0-255)' },
    { value: 'SMALLINT', label: 'SMALLINT - Small integer' },
    { value: 'MEDIUMINT', label: 'MEDIUMINT - Medium integer' },
  ]},
  { label: 'Date & Time Types', options: [
    { value: 'DATETIME', label: 'DATETIME - Date & time' },
    { value: 'DATE', label: 'DATE - Date only' },
    { value: 'TIMESTAMP', label: 'TIMESTAMP - Timestamp' },
    { value: 'TIME', label: 'TIME - Time only' },
    { value: 'YEAR', label: 'YEAR - Year only' },
  ]},
  { label: 'Other Types', options: [
    { value: 'BOOLEAN', label: 'BOOLEAN - True/False' },
    { value: 'JSON', label: 'JSON - JSON document' },
    { value: 'BLOB', label: 'BLOB - Binary data' },
  ]},
];