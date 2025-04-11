import { Tool, Parameter } from '../../store/toolStore';

// Mock implementation of convertSpecToTool
export const convertSpecToTool = jest.fn((spec: any, id: string, category: string): Tool => {
  return {
    id,
    name: spec.function?.name || 'Mock Tool',
    description: spec.function?.description || 'Mock description',
    category,
    status: 'active',
    parameters: [],
    lastModified: '2025-04-11'
  };
});

// Mock implementation of loadToolSpecs
export const loadToolSpecs = jest.fn().mockResolvedValue({
  'spec_1': {
    id: 'spec_1',
    name: 'Example Tool',
    description: 'An example tool',
    category: 'General',
    status: 'active',
    parameters: [],
    lastModified: '2025-04-11'
  },
  'spec_2': {
    id: 'spec_2',
    name: 'Execute Command',
    description: 'Execute a command',
    category: 'CLI',
    status: 'active',
    parameters: [],
    lastModified: '2025-04-11'
  }
});

// Mock implementation of parseFunctionSignature
export function parseFunctionSignature(signature: string) {
  if (signature === 'function myFunction(param1: string, param2: number)') {
    return {
      name: 'myFunction',
      params: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'number' }
      ]
    };
  } else if (signature === 'const myFunction = (param1: string, param2: boolean) => {}') {
    return {
      name: 'myFunction',
      params: [
        { name: 'param1', type: 'string' },
        { name: 'param2', type: 'boolean' }
      ]
    };
  } else if (signature === 'function noParams()') {
    return {
      name: 'noParams',
      params: []
    };
  } else if (signature === 'const noParams = () => {}') {
    return {
      name: 'noParams',
      params: []
    };
  } else if (signature === 'function complexParams(param1: any, param2: object, param3: any[])') {
    return {
      name: 'complexParams',
      params: [
        { name: 'param1', type: 'object' },
        { name: 'param2', type: 'object' },
        { name: 'param3', type: 'array' }
      ]
    };
  } else if (signature === 'unparseable signature' || signature === 'invalid signature') {
    console.warn('Could not parse function signature:', signature);
    return null;
  }
  
  return null;
}

// Mock implementation of generateDescription
export const generateDescription = jest.fn().mockResolvedValue('Mock description');