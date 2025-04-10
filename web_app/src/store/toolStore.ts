import { create } from 'zustand';
import toolsApi from '../services/apiService';

// Type definitions
export interface Parameter {
    id: string;
    name: string;
    type: string;
    description: string;
    required: boolean;
    default?: string | number | boolean | object | null;
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    category: string;
    status: 'active' | 'inactive' | 'draft';
    parameters: Parameter[];
    lastModified: string;
}

// Empty initial state - we'll load real data when the app starts
const initialTools: Record<string, Tool> = {};

interface ToolState {
    tools: Record<string, Tool>;
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;
    getAllTools: () => Tool[];
    getToolById: (id: string) => Tool | undefined;
    addTool: (tool: Omit<Tool, 'id'>) => Promise<string>;
    updateTool: (id: string, tool: Partial<Tool>) => Promise<void>;
    deleteTool: (id: string) => Promise<void>;
    getStats: () => { totalTools: number; activeTools: number; recentlyUpdated: number };
    loadToolSpecifications: () => Promise<void>;
}

export const useToolStore = create<ToolState>()((set, get) => ({
    tools: initialTools,
    isLoaded: false,
    isLoading: false,
    error: null,

    // Load tool specifications from the server
    loadToolSpecifications: async () => {
        set({ isLoading: true, error: null });
        try {
            // Load tools from the API
            const apiTools = await toolsApi.getAll();
            
            set({
                tools: apiTools,
                isLoaded: true,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to load tools:', error);
            set({ 
                isLoading: false, 
                error: error instanceof Error ? error.message : 'Unknown error loading tools',
                isLoaded: true // Set to true so we don't keep trying to load
            });
        }
    },

    // Get all tools as an array
    getAllTools: () => {
        return Object.values(get().tools);
    },

    // Get a specific tool by ID
    getToolById: (id: string) => {
        return get().tools[id];
    },

    // Add a new tool
    addTool: async (tool) => {
        try {
            // Save to API
            const newTool = await toolsApi.create({
                ...tool,
                lastModified: new Date().toISOString()
            });
            
            // Update local state
            set((state) => ({
                tools: {
                    ...state.tools,
                    [newTool.id]: newTool
                }
            }));
            
            return newTool.id;
        } catch (error) {
            console.error('Failed to create tool:', error);
            throw error;
        }
    },

    // Update an existing tool
    updateTool: async (id, updatedTool) => {
        try {
            // Update via API
            const updated = await toolsApi.update(id, {
                ...updatedTool,
                lastModified: new Date().toISOString()
            });
            
            // Update local state
            set((state) => {
                return {
                    tools: {
                        ...state.tools,
                        [id]: updated
                    }
                };
            });
        } catch (error) {
            console.error('Failed to update tool:', error);
            throw error;
        }
    },

    // Delete a tool
    deleteTool: async (id) => {
        try {
            // Delete via API
            await toolsApi.delete(id);
            
            // Update local state
            set((state) => {
                const newTools = { ...state.tools };
                delete newTools[id];
                return { tools: newTools };
            });
        } catch (error) {
            console.error('Failed to delete tool:', error);
            throw error;
        }
    },

    // Get statistics for dashboard
    getStats: () => {
        const tools = Object.values(get().tools);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        return {
            totalTools: tools.length,
            activeTools: tools.filter((tool) => tool.status === 'active').length,
            recentlyUpdated: tools.filter((tool) => {
                const lastModified = new Date(tool.lastModified);
                return lastModified >= thirtyDaysAgo;
            }).length
        };
    }
}));