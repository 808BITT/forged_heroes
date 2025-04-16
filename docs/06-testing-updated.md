# Testing

## Overview

This document outlines the testing strategy and practices for the **Llero platform**, ensuring application reliability, maintainability, and accessibility across all modules—Forge, Barracks, Academy, Armory, and Command Center.

---

## Testing Strategy

Llero employs a multi-layered testing approach:

1. **Unit Testing** – Validate isolated functions/components
2. **Integration Testing** – Ensure components and services interact correctly
3. **End-to-End (E2E) Testing** – Simulate full user flows
4. **Accessibility Testing** – Verify inclusive and usable interfaces
5. **Performance Testing** – Measure render time, API latency, and memory usage

---

## Testing Stack

- **Jest** – Core test runner and mocking
- **React Testing Library** – UI test utilities
- **MSW (Mock Service Worker)** – Seamless API mocking
- **Jest-DOM** – Enhanced assertions
- **Vitest** *(optional for faster builds)* – Compatible alternative

---

## Test Structure

Tests are colocated with components and services when simple, or in `/__tests__/` directories for complex suites.

```
src/
  components/
    ToolCard.tsx
    ToolCard.test.tsx

  services/
    api.ts
    api.test.ts

  __tests__/
    CommandCenter.test.tsx
```

---

## Example Tests

### Component Behavior

```tsx
test('Button calls onClick', () => {
  const handler = jest.fn();
  render(<Button onClick={handler}>Run</Button>);
  fireEvent.click(screen.getByText('Run'));
  expect(handler).toHaveBeenCalled();
});
```

### Zustand Store Logic

```tsx
test('adds tool to store', () => {
  const { result } = renderHook(() => useToolStore());
  act(() => {
    result.current.addTool({ name: 'Llama Tool', description: '', ... });
  });
  expect(result.current.tools).toHaveLength(1);
});
```

### Mocked API Call

```tsx
test('fetches tools via MSW', async () => {
  server.use(rest.get('/api/tools', (req, res, ctx) =>
    res(ctx.json([{ id: '1', name: 'Mock Tool' }]))
  ));
  const tools = await apiService.getAll();
  expect(tools).toHaveLength(1);
});
```

---

## Mocking Utilities

```ts
jest.mock('../services/apiService', () => ({
  getAll: jest.fn().mockResolvedValue([{ id: '1', name: 'Mock Tool' }]),
}));
```

---

## Running Tests

### Local

```bash
npm run test
```

### With Coverage

```bash
npm run test:coverage
```

### In CI

```bash
npm run test:ci
```

Outputs JUnit XML for CI pipelines.

### Debug Mode

```bash
npm run test:debug
```

Includes `--detectOpenHandles` to catch hanging tests.

---

## Best Practices

- ✅ Test **what the user sees**, not internal logic
- ✅ Keep tests **isolated** and **focused**
- ✅ Use **realistic mock data**
- ✅ Prefer **queryByRole** and **queryByLabelText** for accessibility
- ✅ Avoid testing **external libraries**
- ✅ Use `beforeEach`/`afterEach` for setup/cleanup

---

## Accessibility Testing

```tsx
test('button has proper ARIA and focusability', () => {
  render(<Button aria-label="Run tool">Run</Button>);
  expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Run tool');
});
```

Tools to consider:

- [axe-core](https://www.deque.com/axe/) integration
- Lighthouse automated runs (CI-integrated)

---

## Performance Testing Suggestions

- Track **component render times**
- Analyze **bundle size** using `vite-plugin-inspect` or `source-map-explorer`
- Benchmark **critical routes and endpoints**
- Use `console.time`/`console.timeEnd` for bottleneck spotting

---

## End-to-End (E2E) Testing

### Overview
End-to-End tests validate critical user flows by simulating real user interactions in a browser environment. Puppeteer is used for these tests, with the option to run them in headless or visual mode.

### Running E2E Tests

1. **Start the Application**
   Ensure the application is running locally on `http://localhost:3000`.

   ```bash
   npm run dev
   ```

2. **Run E2E Tests**
   Execute the E2E tests using the following command:

   ```bash
   node e2e/example.test.js
   ```

   By default, the tests run in visual mode. To switch to headless mode, modify the `headless` option in the test script.

3. **View Screenshots**
   Screenshots are saved in the `e2e/screenshots` directory:
   - `tool-created.png`: Captured after successfully creating a tool.
   - `error.png`: Captured if an error occurs during the test.

### Best Practices
- Use meaningful selectors (e.g., `id` or `data-testid`) for reliable element targeting.
- Keep tests isolated and focused on specific user flows.
- Regularly update tests to reflect UI changes.

---

## Resources

- [Jest](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [MSW](https://mswjs.io/)
- [axe-core](https://www.deque.com/axe/)

---

Maintaining test coverage and clean test architecture ensures Llero modules evolve rapidly while remaining stable, accessible, and performant.
