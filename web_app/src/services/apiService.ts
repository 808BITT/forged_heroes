import { Tool } from '../store/toolStore';

// Replace this with your actual API URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://192.168.1.209:3001' // Update with the correct production IP
  : 'http://192.168.1.209:3001';

// Handle response errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
};

// API client for tools
export const toolsApi = {
  // Get all tools
  getAll: async (): Promise<Record<string, Tool>> => {
    const response = await fetch(`${API_URL}/api/tools`);
    return handleResponse(response);
  },
  
  // Get a single tool by ID
  getById: async (id: string): Promise<Tool> => {
    const response = await fetch(`${API_URL}/api/tools/${id}`);
    return handleResponse(response);
  },
  
  // Create a new tool
  create: async (tool: Omit<Tool, 'id'>): Promise<Tool> => {
    const response = await fetch(`${API_URL}/api/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tool),
    });
    return handleResponse(response);
  },
  
  // Update an existing tool
  update: async (id: string, tool: Partial<Tool>): Promise<Tool> => {
    const response = await fetch(`${API_URL}/api/tools/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tool),
    });
    return handleResponse(response);
  },
  
  // Delete a tool
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/tools/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Add a new endpoint to parse function signature
  parseFunctionSignature: async (signature: string): Promise<{ name: string, params: { name: string, type: string }[] }> => {
    const response = await fetch(`${API_URL}/api/parseFunctionSignature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature }),
    });
    return handleResponse(response);
  },

  // Add a new endpoint to generate description
  generateDescription: async (name: string): Promise<string> => {
    const response = await fetch(`${API_URL}/api/generateDescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },
};

export default toolsApi;
