const Ajv = require('ajv');

const ajv = new Ajv();

// Define the JSON schema for tool specifications
const toolSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    version: { type: 'string' },
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['object'] },
        properties: { type: 'object' },
        required: { type: 'array', items: { type: 'string' } }
      },
      required: ['type', 'properties']
    },
    returns: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        properties: { type: 'object' }
      },
      required: ['type', 'properties']
    }
  },
  required: ['name', 'description', 'version', 'parameters', 'returns']
};

// Compile the schema
const validateToolSpec = ajv.compile(toolSchema);

module.exports = validateToolSpec;
