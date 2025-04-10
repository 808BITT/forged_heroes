import { Tool } from '../store/toolStore';

// Replace this with your actual API URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourapp.com'
  : 'http://localhost:3001';

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
};

export default toolsApi;
