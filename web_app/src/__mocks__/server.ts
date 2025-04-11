import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { RestRequest } from 'msw'; // Removed unused imports

// Define proper types for the mock data
interface ToolParameter {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ToolParameter[];
  status: string;
  lastModified: string;
  categories: string[];
}

// Use Record to provide proper indexing type
const mockTools: Record<string, Tool> = {
  tool1: {
    id: "tool1",
    name: "Tool 1",
    description: "A sample tool for testing",
    category: "util",
    parameters: [
      {
        id: "param1",
        name: "parameter1",
        type: "string",
        description: "A sample parameter",
        required: true
      }
    ],
    status: "active",
    lastModified: "2023-05-01",
    categories: ["utility", "test"]
  }
};

// Mock API handlers with proper typing
export const handlers = [
  rest.get('/api/tools', (_req, res, ctx) => {
      return res([ctx.status(200), ctx.json(Object.values(mockTools))]);
    }),

  rest.get('/api/tools/:id', (req, res, ctx) => {
      const { id } = req.params;
      // Check if the tool exists
      if (mockTools[id]) {
        return res([ctx.status(200), ctx.json(mockTools[id as string])]);
      }
      return res([ctx.status(404)]);
    }),

  rest.post('/api/tools', (req: RestRequest<any, any>, res, ctx) => {
    // Assuming the request body is of type Tool
    const newTool = req.body as Tool;
    const toolId = newTool.name.toLowerCase().replace(/\s+/g, '_');
    
    // Add the new tool to the mockTools
    mockTools[toolId] = {
      ...newTool,
      id: toolId,
      lastModified: new Date().toISOString()
    };
    
    return res([ctx.status(201), ctx.json(mockTools[toolId])]);
  }),

  rest.put('/api/tools/:id', (req: RestRequest<any, any>, res, ctx) => {
    const { id } = req.params;
    // Check if the tool exists
    if (mockTools[id as string]) {
      // Update the tool
      mockTools[id as string] = {
        ...mockTools[id as string],
        ...(req.body as Partial<Tool>),
        lastModified: new Date().toISOString()
      };
      
      return res([ctx.status(200), ctx.json(mockTools[id as string])]);
    }
    return res([ctx.status(404)]);
  }),

  rest.delete('/api/tools/:id', (req: RestRequest<any, any>, res, ctx) => {
    const { id } = req.params;
    
    // Check if the tool exists
    if (mockTools[id as string]) {
      // Delete the tool
      delete mockTools[id as string];
      return res([ctx.status(204)]);
    }
    return res([ctx.status(404)]);
  }),

  rest.post('/api/test-tool', (req: RestRequest<any, any>, res, ctx) => {
    const { toolSpec, testInput } = req.body;
    
    // Check if required fields are provided in testInput based on toolSpec
    if (toolSpec?.function?.parameters?.required?.length > 0) {
      const requiredParams = toolSpec.function.parameters.required;
      const missingParams = requiredParams.filter((param: string) => !testInput[param] && testInput[param] !== false);
      
      if (missingParams.length > 0) {
        return res([ctx.status(200), ctx.json({
            success: false,
            message: 'Input validation failed',
            validationErrors: missingParams.map((param: string) => ({
              message: `Required field '${param}' is missing`,
              keyword: 'required',
              dataPath: `.${param}`,
              schemaPath: '#/required',
              params: { missingProperty: param }
            }))
          })]); // Removed explicit type argument
      }
    }
    
    // If validation passes, return success
    return res([ctx.status(200), ctx.json({
        success: true,
        message: 'Input validation successful',
        result: {
          output: 'Mock test result output',
          executionTime: '120ms'
        }
      })]);
  }),

  rest.post('/api/assistant/generate-tool-signature', (_req, res, ctx) => {
    // Using _req to indicate the parameter is intentionally unused
    
    return res([ctx.status(200), ctx.json({
        signature: {
          type: "function",
          function: {
            name: "sample_function",
            description: "A sample function generated for testing"
          }
        }
      })]);
  }),

  rest.post('/api/assistant/test-tool-execution', (_req, res, ctx) => {
    // Using _req to indicate the parameter is intentionally unused
    return res([ctx.status(200), ctx.json({
        result: "Tool executed successfully",
        output: { sample: "output" }
      })]);
  }),
];

// Ensure handlers are spread correctly
export const server = setupServer(...handlers);
