import { z } from 'zod';

const sqlTypeRegex = /^(VARCHAR|CHAR|TEXT|TINYTEXT|MEDIUMTEXT|LONGTEXT|TINYINT|SMALLINT|MEDIUMINT|INT|INTEGER|BIGINT|DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|DATE|TIME|DATETIME|TIMESTAMP|YEAR|BINARY|VARBINARY|BLOB|TINYBLOB|MEDIUMBLOB|LONGBLOB|JSON|BOOLEAN|BOOL|ENUM|SET)(\(\d+(,\d+)?\))?$/i;

export const addColumnSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Column name is required')
      .max(64, 'Column name cannot exceed 64 characters')
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Column name must start with a letter or underscore and contain only letters, numbers, and underscores'),
    type: z.string()
      .min(1, 'Column type is required')
      .regex(sqlTypeRegex, 'Invalid SQL data type. Supported types: VARCHAR, CHAR, TEXT, TINYINT, SMALLINT, MEDIUMINT, INT, BIGINT, DECIMAL, FLOAT, DOUBLE, DATE, TIME, DATETIME, TIMESTAMP, BINARY, VARBINARY, BLOB, JSON, BOOLEAN, ENUM, SET, etc. You can also use types with specifications like VARCHAR(255), DECIMAL(10,2), ENUM(\'val1\',\'val2\')'),
    required: z.boolean().default(false),
  }),
});

export const listAttributesSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
  }),
});

export const updateAttributeSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
    attribute_id: z.string().min(1, 'Attribute ID is required'),
  }),
  body: z.object({
    name: z.string()
      .min(1, 'Column name is required')
      .max(64, 'Column name cannot exceed 64 characters')
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Column name must start with a letter or underscore and contain only letters, numbers, and underscores')
      .optional(),
    type: z.string()
      .min(1, 'Column type is required')
      .regex(sqlTypeRegex, 'Invalid SQL data type')
      .optional(),
    required: z.boolean().optional(),
  }).refine(data => data.name !== undefined || data.type !== undefined || data.required !== undefined, {
    message: 'At least one field (name, type, or required) must be provided',
  }),
});

export const deleteAttributeSchema = z.object({
  params: z.object({
    collection_id: z.string().min(1, 'Collection ID is required'),
    attribute_id: z.string().min(1, 'Attribute ID is required'),
  }),
  body: z.object({
    confirm: z.literal(true, { errorMap: () => ({ message: 'Please confirm attribute deletion by setting confirm: true' }) }),
  }),
});