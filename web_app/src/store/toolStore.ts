import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loadToolSpecs } from '../services/toolSpecService';

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
    getAllTools: () => Tool[];
    getToolById: (id: string) => Tool | undefined;
    addTool: (tool: Omit<Tool, 'id'>) => string;
    updateTool: (id: string, tool: Partial<Tool>) => void;
    deleteTool: (id: string) => void;
    getStats: () => { totalTools: number; activeTools: number; recentlyUpdated: number };
    loadToolSpecifications: () => Promise<void>;
}

// Create the store with persistence
export const useToolStore = create<ToolState>()(
    persist(
        (set, get) => ({
            tools: initialTools,
            isLoaded: false,

            // Load tool specifications from JSON files
            loadToolSpecifications: async () => {
                try {
                    const toolSpecs = await loadToolSpecs();

                    set((state) => ({
                        tools: {
                            ...state.tools,
                            ...toolSpecs
                        },
                        isLoaded: true
                    }));
                } catch (error) {
                    console.error('Failed to load tool specifications:', error);
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
            addTool: (tool) => {
                const id = Date.now().toString();
                const newTool = {
                    ...tool,
                    id,
                    lastModified: new Date().toISOString().split('T')[0]
                };

                set((state) => ({
                    tools: {
                        ...state.tools,
                        [id]: newTool
                    }
                }));

                return id;
            },

            // Update an existing tool
            updateTool: (id, updatedTool) => {
                set((state) => {
                    // Skip if tool doesn't exist
                    if (!state.tools[id]) return state;

                    return {
                        tools: {
                            ...state.tools,
                            [id]: {
                                ...state.tools[id],
                                ...updatedTool,
                                lastModified: new Date().toISOString().split('T')[0]
                            }
                        }
                    };
                });
            },

            // Delete a tool
            deleteTool: (id) => {
                set((state) => {
                    const newTools = { ...state.tools };
                    delete newTools[id];
                    return { tools: newTools };
                });
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
        }),
        {
            name: 'forged-heroes-tool-storage',
            skipHydration: false,
        }
    )
);