const Ajv = require('ajv');

const ajv = new Ajv();

// Define the JSON schema for tool specifications
const toolSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['object'] },
        properties: { type: 'object' }
      },
      required: ['type', 'properties']
    },
    annotations: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        readOnlyHint: { type: 'boolean' },
        destructiveHint: { type: 'boolean' },
        idempotentHint: { type: 'boolean' },
        openWorldHint: { type: 'boolean' }
      }
    }
  },
  required: ['name', 'inputSchema']
};

// Compile the schema
const validateToolSpec = ajv.compile(toolSchema);

module.exports = validateToolSpec;
