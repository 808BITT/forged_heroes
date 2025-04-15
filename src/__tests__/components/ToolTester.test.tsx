import { render, screen, fireEvent } from '@testing-library/react';
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
});
