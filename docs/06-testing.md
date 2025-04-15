# Testing

## Overview

This document outlines the testing strategy and practices for the Forge application. Testing is a critical part of our development process to ensure the application functions correctly, provides a good user experience, and remains maintainable.

## Testing Strategy

Forge implements a comprehensive testing approach that includes:

1. **Unit Testing**: Testing individual functions and components in isolation
2. **Integration Testing**: Testing interactions between components
3. **End-to-End Testing**: Testing complete user flows
4. **Accessibility Testing**: Ensuring the application is accessible to all users
5. **Performance Testing**: Monitoring and improving application performance

## Test Tools and Libraries

The project uses the following testing tools:

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking
- **Jest-DOM**: DOM testing utilities

## Test File Organization

Tests are organized alongside the code they are testing:

```
src/
  components/
    Button.tsx
    Button.test.tsx
  services/
    apiService.ts
    apiService.test.ts
  store/
    toolStore.ts
    toolStore.test.ts
```

For more complex test scenarios, dedicated test directories are used:

```
src/
  __tests__/
    components/
      ToolEditor.test.tsx
    store/
      toolStore.test.ts
```

## Writing Unit Tests

### Component Testing

When testing React components, focus on user interactions and outcomes rather than implementation details:

```tsx
// Example component test
describe('Button component', () => {
  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Store Testing

For Zustand store testing, use the approach of mounting store hooks with React Testing Library:

```tsx
// Example store test
describe('toolStore', () => {
  test('should add a tool to the store', async () => {
    const { result } = renderHook(() => useToolStore());
    
    act(() => {
      result.current.addTool({
        name: 'Test Tool',
        description: 'Test Description',
        category: 'General',
        parameters: [],
        status: 'active',
        lastModified: new Date().toISOString()
      });
    });
    
    expect(result.current.tools).toHaveLength(1);
    expect(result.current.tools[0].name).toBe('Test Tool');
  });
});
```

### Service Testing

When testing services, mock external dependencies:

```tsx
// Example service test
describe('apiService', () => {
  test('should fetch tools', async () => {
    // Setup MSW to mock API response
    server.use(
      rest.get('/api/tools', (req, res, ctx) => {
        return res(ctx.json([
          { id: '1', name: 'Mock Tool', description: 'Mock Description' }
        ]));
      })
    );
    
    const tools = await apiService.getAll();
    
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('Mock Tool');
  });
});
```

## Mocking

Use Jest's mocking capabilities to isolate the code being tested:

```tsx
// Example of mocking a service
jest.mock('../services/apiService', () => ({
  getAll: jest.fn().mockResolvedValue([
    { id: '1', name: 'Mock Tool', description: 'Mock Description' }
  ]),
  getById: jest.fn().mockImplementation((id) => {
    return Promise.resolve({ id, name: 'Mock Tool', description: 'Mock Description' });
  })
}));
```

## Test Coverage

Aim for high test coverage across all parts of the application:

- **Components**: Test all user interactions and conditional rendering
- **Services**: Test success and error paths for all API calls
- **Store**: Test all state changes and selectors
- **Utils**: Test all utility functions with various inputs

Run coverage reports regularly:

```bash
npm run test:coverage
```

## Continuous Integration

Tests are automatically run in CI pipelines:

```bash
npm run test:ci
```

This command runs tests with the CI reporter which outputs JUnit XML reports for CI systems to consume.

## Debugging Tests

For debugging problematic tests:

```bash
npm run test:debug
```

This command runs Jest in debug mode with the `--detectOpenHandles` flag to help identify tests that aren't cleaning up properly.

## Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how it does it
2. **Use realistic test data**: Tests should use data that resembles real-world usage
3. **Keep tests simple and focused**: Each test should verify one specific behavior
4. **Avoid testing third-party code**: Focus on your own code, trust that libraries work as documented
5. **Maintain test independence**: Tests should not depend on each other
6. **Use setup and teardown**: Properly initialize and clean up test environments
7. **Write testable code**: Design components and functions to be easily testable

## Accessibility Testing

Use accessibility testing tools:

```jsx
// Example accessibility test
test('button is accessible', () => {
  render(<Button>Click Me</Button>);
  
  const button = screen.getByRole('button');
  
  expect(button).toHaveAttribute('aria-label');
  expect(button).toHaveAttribute('tabIndex', '0');
});
```

## Performance Testing

Monitor key performance metrics:

- Component render times
- API response times
- Bundle size
- Memory usage

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/docs/)
