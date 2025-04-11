import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToolTester } from '../../components/ToolTester';

// Mock fetch API
global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ToolTester', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Ensure fetch is mocked
  });

  afterEach(() => {
    jest.resetAllMocks(); // Reset mocks after each test
  });

  const mockToolSpec = {
    type: 'function',
    function: {
      name: 'test_function',
      description: 'Test function',
      parameters: {
        type: 'object',
        properties: {
          input: {
            type: 'string',
            description: 'Input parameter',
          },
        },
        required: ['input'],
      },
    },
  };

  test('renders test dialog button', () => {
    render(<ToolTester toolSpec={mockToolSpec} />);
    expect(screen.getByText(/Test/i)).toBeInTheDocument();
  });

  test('opens dialog when test button is clicked', () => {
    render(<ToolTester toolSpec={mockToolSpec} />);

    // Use a more specific query to avoid ambiguity
    const testButton = screen.getByRole('button', { name: /^Test Tool$/i });
    fireEvent.click(testButton);

    expect(screen.getByText(/Test Tool:/i)).toBeInTheDocument();
    expect(screen.getByText(/Input Parameters/i, { selector: 'h3' })).toBeInTheDocument();
  });

  test('submits test input and shows results', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ result: 'Success' }),
    });

    render(<ToolTester toolSpec={mockToolSpec} />);

    const testButton = screen.getByRole('button', { name: /^Test Tool$/i });
    fireEvent.click(testButton);

    const inputField = screen.getByRole('textbox', { name: /Input parameter/i });
    fireEvent.change(inputField, { target: { value: 'test value' } });

    const runTestButton = screen.getByRole('button', { name: /^Test Tool$/i });
    fireEvent.click(runTestButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Successful/i)).toBeInTheDocument();
      expect(screen.getByText(/Mock Result:/i)).toBeInTheDocument();
    });
  });

  test('shows validation errors for invalid input', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({
        success: false,
        message: 'Validation failed',
        validationErrors: [
          { message: 'Input parameter is required' },
        ],
      }),
    });

    render(
      <BrowserRouter>
        <ToolTester toolSpec={mockToolSpec} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Test/i));
    const runTestButton = screen.getByRole('button', { name: /Test Tool/i });
    fireEvent.click(runTestButton);

    await waitFor(() => {
      expect(screen.getByText('Input parameter is required')).toBeInTheDocument();
    });
  });

  test('handles API errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <ToolTester toolSpec={mockToolSpec} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Test/i));
    const inputField = screen.getByRole('textbox'); // Use role to find the input
    fireEvent.change(inputField, { target: { value: 'test value' } });

    const runTestButton = screen.getByRole('button', { name: /Test Tool/i });
    fireEvent.click(runTestButton);

    await waitFor(() => {
      expect(screen.getByText('Error connecting to server: API Error')).toBeInTheDocument();
    });
  });
});
