import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    
    fireEvent.click(screen.getByText(/Test/i));
    
    expect(screen.getByText(/Test Tool/i)).toBeInTheDocument();
    expect(screen.getByText(/Input parameter/i)).toBeInTheDocument();
  });

  test('submits test input and shows results', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ result: 'Success' }),
    });

    render(<ToolTester toolSpec={mockToolSpec} />);

    fireEvent.click(screen.getByText(/Test/i));
    const inputField = screen.getByRole('textbox'); // Use role to find the input
    fireEvent.change(inputField, { target: { value: 'test value' } });
    const runTestButton = screen.getByRole('button', { name: /Run Test/i });
    fireEvent.click(runTestButton);

    await waitFor(() => {
      expect(screen.getByText(/Test Successful/i)).toBeInTheDocument();
      expect(screen.getByText(/Mock result/i)).toBeInTheDocument();
    });
  });

  test('shows validation errors for invalid input', async () => {
    render(<ToolTester toolSpec={mockToolSpec} />);
    
    fireEvent.click(screen.getByText(/Test/i));
    
    // Use a more flexible matcher for the "Run Test" button
    const runTestButton = screen.getByRole('button', { name: /Run Test/i });
    fireEvent.click(runTestButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Input validation failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Required field missing/i)).toBeInTheDocument();
    });
  });

  test('handles API errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<ToolTester toolSpec={mockToolSpec} />);

    fireEvent.click(screen.getByText(/Test/i));
    const inputField = screen.getByRole('textbox'); // Use role to find the input
    fireEvent.change(inputField, { target: { value: 'test value' } });

    // Adjust the matcher to match the actual button text
    const runTestButton = screen.getByRole('button', { name: /Test Tool/i });
    fireEvent.click(runTestButton);

    await waitFor(() => {
      expect(screen.getByText(/Error testing tool/i)).toBeInTheDocument();
    });
  });
});
