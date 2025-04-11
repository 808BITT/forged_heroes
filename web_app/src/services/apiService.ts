import { Tool } from '../store/toolStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Helper function to handle API fetch requests with proper error handling
 */
async function fetchWithErrorHandling<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = 
        errorData?.message || 
        `API Error: ${response.status} ${response.statusText}`;
      
      throw new Error(errorMessage);
    }

    // Handle 204 No Content response
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API call failed: ${error.message}`);
      throw error;
    }
    throw new Error('Unknown error occurred during API call');
  }
}

const toolsApi = {
  /**
   * Get all tools from the API
   */
  getAll: async (): Promise<Record<string, Tool>> => {
    return fetchWithErrorHandling<Record<string, Tool>>(`${API_URL}/tools`);
  },
  
  /**
   * Get a specific tool by ID
   */
  getById: async (id: string): Promise<Tool> => {
    return fetchWithErrorHandling<Tool>(`${API_URL}/tools/${id}`);
  },
  
  /**
   * Create a new tool
   */
  create: async (tool: Omit<Tool, 'id'>): Promise<Tool> => {
    return fetchWithErrorHandling<Tool>(`${API_URL}/tools`, {
      method: 'POST',
      body: JSON.stringify(tool),
    });
  },
  
  /**
   * Update an existing tool
   */
  update: async (id: string, updates: Partial<Tool>): Promise<Tool> => {
    return fetchWithErrorHandling<Tool>(`${API_URL}/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  /**
   * Delete a tool
   */
  delete: async (id: string): Promise<void> => {
    return fetchWithErrorHandling<void>(`${API_URL}/tools/${id}`, {
      method: 'DELETE',
    });
  },
  
  /**
   * Test a tool specification with sample input
   */
  testTool: async (toolSpec: any, testInput: any): Promise<any> => {
    return fetchWithErrorHandling<any>(`${API_URL}/test-tool`, {
      method: 'POST',
      body: JSON.stringify({ toolSpec, testInput }),
    });
  },
  
  /**
   * Parse a function signature
   */
  parseFunctionSignature: async (signature: string): Promise<any> => {
    return fetchWithErrorHandling<any>(`${API_URL}/parseFunctionSignature`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    });
  },
  
  /**
   * Generate description for a function signature
   */
  generateDescription: async (signature: string): Promise<string> => {
    const response = await fetchWithErrorHandling<{ description: string }>(`${API_URL}/generateDescription`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    });
    
    return response.description;
  },
};

export default toolsApi;
