import { renderHook, act } from '@testing-library/react-hooks';
import { useToolStore } from '../../store/toolStore';
import toolsApi from '../../services/apiService';

// Mock the API service
jest.mock('../../services/apiService', () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

describe('toolStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useToolStore.setState({
        tools: {},
        isLoaded: false,
        isLoading: false,
        error: null,
      });
    });
    
    // Clear mocks
    jest.clearAllMocks();
  });

  test('should load tools successfully', async () => {
    const mockTools = {
      tool1: {
        id: 'tool1',
        name: 'Tool 1',
        description: 'Description 1',
        category: 'General',
        parameters: [],
        status: 'active',
        lastModified: '2023-01-01T00:00:00Z',
        categories: ['General'],
      },
    };
    
    (toolsApi.getAll as jest.Mock).mockResolvedValueOnce(mockTools);
    
    const { result, waitForNextUpdate } = renderHook(() => useToolStore());
    
    act(() => {
      result.current.loadToolSpecifications();
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.tools).toEqual(mockTools);
  });

  test('should handle loading error', async () => {
    const errorMessage = 'Failed to fetch tools';
    (toolsApi.getAll as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    const { result, waitForNextUpdate } = renderHook(() => useToolStore());
    
    act(() => {
      result.current.loadToolSpecifications();
    });
    
    await waitForNextUpdate();
    
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toContain(errorMessage);
  });

  test('should add a tool', async () => {
    const newTool = {
      name: 'New Tool',
      description: 'New Description',
      category: 'General',
      parameters: [],
      status: 'active' as const,
      categories: ['General'],
      lastModified: '2023-01-01T00:00:00Z',
    };
    
    const createdTool = {
      ...newTool,
      id: 'new-id',
    };
    
    (toolsApi.create as jest.Mock).mockResolvedValueOnce(createdTool);
    
    const { result, waitForNextUpdate } = renderHook(() => useToolStore());
    
    let returnedId: string | undefined;
    act(() => {
      result.current.addTool(newTool).then(id => {
        returnedId = id;
      });
    });
    
    await waitForNextUpdate();
    
    expect(toolsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Tool',
        description: 'New Description',
        categories: ['General'],
        category: 'General',
        status: 'active',
        parameters: [],
        lastModified: expect.any(String), // Updated to allow dynamic values
      })
    );
    expect(returnedId).toBe('new-id');
    expect(result.current.tools['new-id']).toEqual(createdTool);
  });

  test('should update a tool', async () => {
    // Setup initial state with a tool
    const initialTool = {
      id: 'tool1',
      name: 'Tool 1',
      description: 'Description 1',
      category: 'General',
      parameters: [],
      status: 'active' as const,
      lastModified: '2023-01-01T00:00:00Z',
      categories: ['General'],
    };
    
    act(() => {
      useToolStore.setState({
        tools: { 'tool1': initialTool },
        isLoaded: true,
        isLoading: false,
        error: null,
      });
    });
    
    const updates = {
      name: 'Updated Tool',
      description: 'Updated Description',
    };
    
    const updatedTool = {
      ...initialTool,
      ...updates,
      lastModified: expect.any(String),
    };
    
    (toolsApi.update as jest.Mock).mockResolvedValueOnce(updatedTool);
    
    const { result, waitForNextUpdate } = renderHook(() => useToolStore());
    
    act(() => {
      result.current.updateTool('tool1', updates);
    });
    
    await waitForNextUpdate();
    
    expect(toolsApi.update).toHaveBeenCalledWith('tool1', expect.objectContaining(updates));
    expect(result.current.tools['tool1']).toEqual(updatedTool);
  });

  test('should delete a tool', async () => {
    // Setup initial state with a tool
    const initialTool = {
      id: 'tool1',
      name: 'Tool 1',
      description: 'Description 1',
      category: 'General',
      parameters: [],
      status: 'active' as const,
      lastModified: '2023-01-01T00:00:00Z',
      categories: ['General'],
    };
    
    act(() => {
      useToolStore.setState({
        tools: { 'tool1': initialTool },
        isLoaded: true,
        isLoading: false,
        error: null,
      });
    });
    
    (toolsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);
    
    const { result, waitForNextUpdate } = renderHook(() => useToolStore());
    
    act(() => {
      result.current.deleteTool('tool1');
    });
    
    await waitForNextUpdate();
    
    expect(toolsApi.delete).toHaveBeenCalledWith('tool1');
    expect(result.current.tools['tool1']).toBeUndefined();
  });

  test('should get all tools as array', () => {
    const tools = {
      tool1: {
        id: 'tool1',
        name: 'Tool 1',
        description: 'Description 1',
        category: 'General',
        parameters: [],
        status: 'active' as const,
        lastModified: '2023-01-01T00:00:00Z',
        categories: ['General'],
      },
      tool2: {
        id: 'tool2',
        name: 'Tool 2',
        description: 'Description 2',
        category: 'API',
        parameters: [],
        status: 'active' as const,
        lastModified: '2023-01-02T00:00:00Z',
        categories: ['API'],
      },
    };
    
    act(() => {
      useToolStore.setState({
        tools,
        isLoaded: true,
        isLoading: false,
        error: null,
      });
    });
    
    const { result } = renderHook(() => useToolStore());
    
    const allTools = result.current.getAllTools();
    
    expect(allTools).toHaveLength(2);
    expect(allTools).toContainEqual(tools.tool1);
    expect(allTools).toContainEqual(tools.tool2);
  });
});
