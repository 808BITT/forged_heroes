// Mock implementation of MSW without imports
// Define types for our mock MSW implementation
type ResponseResolver = (req: any, res: any, ctx: any) => any;

interface RestHandler {
  get: (url: string, resolver: ResponseResolver) => any;
  post: (url: string, resolver: ResponseResolver) => any;
  put: (url: string, resolver: ResponseResolver) => any;
  delete: (url: string, resolver: ResponseResolver) => any;
}

interface MockContext {
  status: (code: number) => any;
  json: (data: any) => any;
}

interface MockResponse {
  (transformers: any[]): any;
}

interface MockRequest {
  params: Record<string, string>;
  body: any;
}

// Create a minimal MSW-like functionality
const rest: RestHandler = {
  get: (url: string, resolver: ResponseResolver) => ({ type: 'GET', url, resolver }),
  post: (url: string, resolver: ResponseResolver) => ({ type: 'POST', url, resolver }),
  put: (url: string, resolver: ResponseResolver) => ({ type: 'PUT', url, resolver }),
  delete: (url: string, resolver: ResponseResolver) => ({ type: 'DELETE', url, resolver })
};

// Mock context functions
const ctx: MockContext = {
  status: (code: number) => ({ type: 'status', code }),
  json: (data: any) => ({ type: 'json', data })
};

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
      return res([ctx.status(200), ctx.json(mockTools[id])]);
    }
    return res([ctx.status(404)]);
  }),

  rest.post('/api/tools', (req, res, ctx) => {
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

  rest.put('/api/tools/:id', (req, res, ctx) => {
    const { id } = req.params;
    // Check if the tool exists
    if (mockTools[id]) {
      // Update the tool
      mockTools[id] = {
        ...mockTools[id],
        ...(req.body as Partial<Tool>),
        lastModified: new Date().toISOString()
      };
      
      return res([ctx.status(200), ctx.json(mockTools[id])]);
    }
    return res([ctx.status(404)]);
  }),

  rest.delete('/api/tools/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    // Check if the tool exists
    if (mockTools[id]) {
      // Delete the tool
      delete mockTools[id];
      return res([ctx.status(204)]);
    }
    return res([ctx.status(404)]);
  }),

  rest.post('/api/test-tool', (req, res, ctx) => {
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
        })]);
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

// Mock server setup function
export const server = {
  listen: () => {
    console.log('MSW mock server started');
    return { close: () => console.log('MSW mock server stopped') };
  },
  resetHandlers: (...newHandlers: any[]) => {
    console.log('MSW mock handlers reset', newHandlers.length ? 'with new handlers' : '');
  },
  close: () => {
    console.log('MSW mock server closed');
  },
  use: (...handlers: any[]) => {
    console.log('Using handlers:', handlers.length);
  }
};

// Helper function to set up the server - mimics setupServer from MSW
export function setupServer(...handlers: any[]) {
  console.log(`Mock server initialized with ${handlers.length} handlers`);
  return server;
}
