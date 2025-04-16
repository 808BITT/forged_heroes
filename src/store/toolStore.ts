import { create } from 'zustand';
import toolsApi from '../services/apiService';

// Define or import the Category type
export interface Category {
    id: string;
    name: string;
}

// Type definitions
export interface Parameter {
    id: string;
    name: string;
    type: string;
    description: string;
    required: boolean;
    // New fields for enhanced parameter types
    format?: string;
    enumValues?: string[];
    minimum?: string;
    maximum?: string;
    default?: string;
    arrayItemType?: string;
    arrayItemDescription?: string;
    objectProperties?: Record<string, any>;
    dependencies?: {
        conditions: Array<{
            id: string;
            paramId: string;
            operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
            value: string;
        }>;
        effect: 'required' | 'visible' | 'hidden';
    } | null;
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
        try {
            set({ isLoading: true, error: null });
            const fetchedTools = await toolsApi.getAll();
            console.log('Fetched tools:', fetchedTools); // Debugging log
            set({
                tools: fetchedTools,
                isLoading: false,
                isLoaded: true,
                error: null
            });
        } catch (error) {
            console.error('Failed to load tools:', error);
            let errorMessage = 'Failed to load tools: ';
            if (error instanceof Error) {
                errorMessage += error.message;
            } else if (typeof error === 'string') {
                errorMessage += error;
            } else {
                errorMessage += 'Unknown error';
            }
            set({ 
                isLoading: false, 
                error: errorMessage,
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

export const useToolEditorStore = create<{
    name: string;
    description: string;
    category: string;
    parameters: Parameter[];
    categories: Category[];
    highlightedFields: Record<string, boolean>;
    errors: string[];
    jsonPreview: string;
    copied: boolean;
    isLoadingCategories: boolean;
    categoryError: string;
    categoryModalOpen: boolean;
    newCategoryName: string;
    isSavingCategory: boolean;
    newCategoryError: string;

    setName: (name: string) => void;
    setDescription: (description: string) => void;
    setCategory: (category: string) => void;
    setParameters: (parameters: Parameter[]) => void;
    setCategories: (categories: Category[]) => void;
    setHighlightedFields: (fields: Record<string, boolean>) => void;
    setErrors: (errors: string[]) => void;
    setJsonPreview: (preview: string) => void;
    setCopied: (copied: boolean) => void;
    setIsLoadingCategories: (isLoading: boolean) => void;
    setCategoryError: (error: string) => void;
    setCategoryModalOpen: (isOpen: boolean) => void;
    setNewCategoryName: (name: string) => void;
    setIsSavingCategory: (isSaving: boolean) => void;
    setNewCategoryError: (error: string) => void;
}>(set => ({
    name: "",
    description: "",
    category: "General",
    parameters: [],
    categories: [],
    highlightedFields: {},
    errors: [],
    jsonPreview: "",
    copied: false,
    isLoadingCategories: false,
    categoryError: "",
    categoryModalOpen: false,
    newCategoryName: "",
    isSavingCategory: false,
    newCategoryError: "",

    setName: (name: string) => set({ name }),
    setDescription: (description: string) => set({ description }),
    setCategory: (category: string) => set({ category }),
    setParameters: (parameters: Parameter[]) => set({ parameters }),
    setCategories: (categories: Category[]) => set({ categories }),
    setHighlightedFields: (fields: Record<string, boolean>) => set({ highlightedFields: fields }),
    setErrors: (errors: string[]) => set({ errors }),
    setJsonPreview: (preview: string) => set({ jsonPreview: preview }),
    setCopied: (copied: boolean) => set({ copied }),
    setIsLoadingCategories: (isLoading: boolean) => set({ isLoadingCategories: isLoading }),
    setCategoryError: (error: string) => set({ categoryError: error }),
    setCategoryModalOpen: (isOpen: boolean) => set({ categoryModalOpen: isOpen }),
    setNewCategoryName: (name: string) => set({ newCategoryName: name }),
    setIsSavingCategory: (isSaving: boolean) => set({ isSavingCategory: isSaving }),
    setNewCategoryError: (error: string) => set({ newCategoryError: error }),
}));