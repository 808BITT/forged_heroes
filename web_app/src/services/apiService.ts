import { Tool } from '../store/toolStore';

// Create a getApiUrl function to handle both Vite and Jest environments
const getApiUrl = () => {
  try {
    // For Vite environment
    if (typeof import.meta.env !== 'undefined') {
      return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    }
  } catch (e) {
    // For Jest environment
    return 'http://localhost:3001/api';
  }
  
  // Default fallback
  return 'http://localhost:3001/api';
};

// Initialize API_URL using the helper function
const API_URL = getApiUrl();

export interface Category {
  id: string;
  name: string;
}

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
    const response = await fetchWithErrorHandling<Record<string, Tool>>(`${API_URL}/tools`);
    console.log('API response:', response); // Debugging log
    return response;
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

  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    return fetchWithErrorHandling<Category[]>(`${API_URL}/categories`);
  },

  /**
   * Create a new category
   */
  createCategory: async (name: string): Promise<Category> => {
    return fetchWithErrorHandling<Category>(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: string): Promise<void> => {
    return fetchWithErrorHandling<void>(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

export default toolsApi;
