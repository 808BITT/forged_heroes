import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ToolEditor from '../../components/ToolEditor';
import { useToolStore } from '../../store/toolStore';
import { parseFunctionSignature, generateDescription } from '../../services/toolSpecService';
import toolsApi from '../../services/apiService'; // Import the actual apiService

// Mock the services
jest.mock('../../services/toolSpecService', () => ({
  parseFunctionSignature: jest.fn(),
  generateDescription: jest.fn(),
}));

// Mock Zustand store
jest.mock('../../store/toolStore', () => ({
  useToolStore: jest.fn(),
}));

// Mock the API service
jest.mock('../../services/apiService', () => ({
  getCategories: jest.fn().mockResolvedValue([
    { id: 'cat-1', name: 'General' },
    { id: 'cat-2', name: 'CLI' },
    { id: 'cat-3', name: 'API' },
    { id: 'cat-4', name: 'Data' }
  ]),
  createCategory: jest.fn().mockImplementation((name) =>
    Promise.resolve({ id: `cat-new-${Date.now()}`, name })
  ),
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

describe('ToolEditor', () => {
  // Setup mock store
  const mockAddTool = jest.fn().mockResolvedValue('new-tool-id');
  const mockUpdateTool = jest.fn().mockResolvedValue(undefined);
  const mockDeleteTool = jest.fn().mockResolvedValue(undefined);
  const mockGetToolById = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    (useToolStore as unknown as jest.Mock).mockReturnValue({
      getToolById: mockGetToolById,
      addTool: mockAddTool,
      updateTool: mockUpdateTool,
      deleteTool: mockDeleteTool,
      tools: [],
      loading: false,
    } as any);
  });

  test('renders form with correct fields', () => {
    render(
      <BrowserRouter>
        <ToolEditor />
      </BrowserRouter>
    );
  
    // Check that the form loads with proper title and default fields
    expect(screen.getByText(/Create Tool/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tool Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Tool Description')).toBeInTheDocument();

    // Ensure "Category" label is associated with a form control
    expect(screen.getAllByText(/Category/i).length).toBeGreaterThan(0);

    // Should have at least one parameter by default
    expect(screen.getByText(/Parameter 1/i)).toBeInTheDocument();
  });

  test('adds a new parameter when "Add Parameter" button is clicked', () => {
    render(
      <BrowserRouter>
        <ToolEditor />
      </BrowserRouter>
    );

    // Initially, there should be one parameter
    expect(screen.getAllByText(/Parameter Name/i).length).toBe(1);

    // Click "Add Parameter" button
    fireEvent.click(screen.getByText('Add Parameter'));

    // Now there should be two parameters
    expect(screen.getAllByText(/Parameter Name/i).length).toBe(2);
  });

  test('submits new tool when form is valid', async () => {
    render(
      <BrowserRouter>
        <ToolEditor />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Tool Name/i), {
      target: { value: 'Test Tool' },
    });

    fireEvent.change(screen.getByLabelText('Tool Description'), {
      target: { value: 'New tool description' },
    });

    // Fill out parameter name and description
    const paramNameInput = screen.getByPlaceholderText('e.g. location');
    fireEvent.change(paramNameInput, {
      target: { value: 'testParam' },
    });

    const paramDescInput = screen.getByPlaceholderText('Describe the parameter');
    fireEvent.change(paramDescInput, {
      target: { value: 'Test parameter description' },
    });

    // Click save button
    const saveButton = screen.getByRole('button', { name: /^Save$/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAddTool).toHaveBeenCalledTimes(1);
      expect(mockAddTool).toHaveBeenCalledWith({
        name: 'Test Tool',
        description: 'New tool description',
        category: '',
        functionSignature: '',
        parameters: [{
          name: 'testParam',
          description: 'Test parameter description',
        }],
      });
    });
  });

  test('processes function signature input', async () => {
    // Adjust mock return values for parseFunctionSignature and generateDescription
    (parseFunctionSignature as jest.Mock).mockReturnValue({
      name: 'testFunction',
      params: [{ name: 'param1', type: 'string' }],
    });

    (generateDescription as jest.Mock).mockResolvedValue('Auto-generated description');

    render(
      <BrowserRouter>
        <ToolEditor />
      </BrowserRouter>
    );

    // Input a function signature
    const functionSignatureInput = screen.getByLabelText(/Function Signature/i);
    fireEvent.change(functionSignatureInput, {
      target: { value: 'function testFunction(param1: string)' },
    });
    
    // Trigger the blur event to process the signature
    fireEvent.blur(functionSignatureInput);

    await waitFor(() => {
      expect(parseFunctionSignature).toHaveBeenCalledWith('function testFunction(param1: string)');
      expect(generateDescription).toHaveBeenCalledWith('function testFunction(param1: string)');
    });

    // Ensure the tool name is set correctly for function signature input
    await waitFor(() => {
      expect((screen.getByLabelText(/Tool Name/i) as HTMLInputElement).value).toBe('testFunction');
    });
  });

  test("can add a new category", async () => {
    (toolsApi.createCategory as jest.Mock).mockImplementation((name) =>
      Promise.resolve({ id: `cat-new-${Date.now()}`, name })
    );

    render(
      <BrowserRouter>
        <ToolEditor />
      </BrowserRouter>
    );

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getAllByText(/Category/i)[0]).toBeInTheDocument();
    });

    // Click add category button
    const addButton = screen.getByText(/Add Category/i);
    fireEvent.click(addButton);

    // Enter new category name
    const input = screen.getByLabelText(/Category Name/i);
    fireEvent.change(input, { target: { value: 'New Test Category' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Add Category$/i });
    fireEvent.click(submitButton);

    // Wait for toast notification
    await waitFor(() => {
      expect(screen.getByText(/Category added/i)).toBeInTheDocument();
    });
  });
});
