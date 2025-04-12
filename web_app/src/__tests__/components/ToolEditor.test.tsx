import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ToolEditor from '../../components/ToolEditor';
import toolsApi from '../../services/apiService'; // Import the actual apiService
import { useToolStore } from '../../store/toolStore';

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

    // Verify there are no parameters by default - Add Parameter button should be available
    expect(screen.getByText(/Add Parameter/i)).toBeInTheDocument();
    // Verify no parameter heading is initially rendered
    expect(screen.queryByText(/Parameter 1/i)).not.toBeInTheDocument();
  });

  test('adds a new parameter when "Add Parameter" button is clicked', () => {
    render(
      <BrowserRouter>
        <ToolEditor />
      </BrowserRouter>
    );

    // Initially, there should be no parameters
    expect(screen.queryByText(/Parameter 1/i)).not.toBeInTheDocument();

    // Click "Add Parameter" button
    fireEvent.click(screen.getByText('Add Parameter'));

    // Now there should be one parameter
    expect(screen.getByText(/Parameter 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Parameter Name/i)).toBeInTheDocument();

    // Click "Add Parameter" button again
    fireEvent.click(screen.getByText('Add Parameter'));

    // Now there should be two parameters
    expect(screen.getByText(/Parameter 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Parameter 2/i)).toBeInTheDocument();
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

    // Add a parameter first
    fireEvent.click(screen.getByText('Add Parameter'));

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

    await waitFor(async () => {
      await waitFor(() => expect(mockAddTool).toHaveBeenCalledTimes(1));
      expect(mockAddTool).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Tool',
        description: 'New tool description',
        category: 'General',
        parameters: expect.arrayContaining([
          expect.objectContaining({
            name: 'testParam',
            description: 'Test parameter description',
          })
        ]),
      }));
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

  test('deletes a parameter when delete button is clicked', () => {
    render(
      <BrowserRouter>
        <ToolEditor />
      </BrowserRouter>
    );

    // Add two parameters
    fireEvent.click(screen.getByText('Add Parameter'));
    fireEvent.click(screen.getByText('Add Parameter'));

    // Verify two parameters are displayed
    expect(screen.getByText(/Parameter 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Parameter 2/i)).toBeInTheDocument();

    // Find the first delete button (there are multiple delete buttons, but we want the one in the header)
    const deleteButtons = screen.getAllByRole('button', { name: '' });
    const trashIcons = screen.getAllByTitle(/trash/i) || []; // fallback in case trash is rendered as SVG with title

    // Click the first delete button we can find
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    } else if (trashIcons.length > 0) {
      fireEvent.click(trashIcons[0]);
    } else {
      // If we can't find buttons by role or title, try to find buttons containing trash icons
      const allButtons = screen.getAllByRole('button');
      // Find the first delete button that contains Trash icon by examining button contents
      const deleteButton = allButtons.find(button =>
        button.querySelector('svg') &&
        !button.textContent?.includes('Add') &&
        !button.textContent?.includes('Save')
      );

      expect(deleteButton).toBeTruthy();
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    }

    // Verify only one parameter remains
    expect(screen.queryAllByText(/Parameter/i).length).toBe(1);
  });
});
