# Refactoring & Fix Checklist

This checklist outlines areas identified for refactoring, fixing, or improvement before adding significant new features to the Llero platform.

## Frontend (React Components & Logic)

-   [X] **`ToolEditor` State Management:** Refactor complex `useState` usage (name, description, parameters, etc.) into a more structured approach, potentially using `useReducer` or a dedicated Zustand slice for the form state.
-   [X] **`ToolEditor` Validation Logic:** Extract the `validateForm` function into a separate utility or custom hook. Improve error message handling (avoid hardcoding strings, provide clearer user feedback). Decouple validation logic from UI highlighting logic (`highlightedFields`).
-   [X] **`ToolEditor` JSON Generation:** Move the `toolSpec` generation logic currently inside `useEffect` into a dedicated function within `toolSpecService.ts` or a similar utility file.
-   [ ] **`ToolEditor` Event Handlers:** Extract complex handlers (`handleSave`, `handleDelete`, parameter/category updates) into `toolEditorHandlers.ts` or a custom hook to reduce component size and improve testability.
-   [ ] **`ArrayItemConfig` Implementation:** Implement the placeholder `onUpdate` function passed to `ArrayItemConfig` within `ToolEditor.tsx`.
-   [ ] **`ParameterEditor` Rendering:** Re-evaluate the `renderTypeSpecificFields` prop. Consider moving the responsibility for rendering type-specific fields *into* `ParameterEditor` based on the `param.type`, rather than having the parent inject JSX.
-   [ ] **Error Handling (UI):** Implement more user-facing error feedback mechanisms (e.g., toasts for API errors, inline validation messages) instead of relying heavily on `console.error`.
-   [ ] **Type Safety:** Conduct a review to minimize the use of `any` type, especially for complex objects like `objectProperties` and API response data. Ensure interfaces (`Parameter`, `Tool`) are strictly enforced.
-   [ ] **Constants:** Centralize shared constants like `PARAMETER_TYPES` (used in `ParameterEditor`) and dependency effect strings (`'required'`, `'visible'`, `'hidden'`) used in `ParameterDependency` and `store/toolStore.ts`.

## Services & State Management

-   [ ] **`toolSpecService` Data Loading:** Modify `loadToolSpecs` to fetch tool specifications from the backend API instead of relying on static JSON file imports.
-   [ ] **API Service Error Handling:** Ensure `apiService.ts` handles potential network/API errors gracefully (e.g., catching fetch errors, handling non-2xx responses) and provides typed responses or errors.

## Backend (Server & Database)

-   [ ] **API Error Responses:** Standardize backend error responses to provide consistent structure and informative (but not overly revealing) messages for different error types (validation, not found, server error).
-   [ ] **Database Migrations:** Formalize the database migration process beyond the initial `migrate-tools.js` script, especially as new tables (Agents, Providers, Sessions) are added.

## Documentation & Consistency

-   [ ] **License Consistency:** Resolve the discrepancy in licensing information between `README.md` (mentions BSL variant) and `llero-handbook.md` (mentions MIT). Ensure `LICENSE.md` is the single source of truth and accurately reflected elsewhere.
-   [ ] **Placeholder Links/Emails:** Update placeholder `yourusername` GitHub links and `yourdomain.com` email addresses in `README.md`, `llero-handbook.md`, and potentially other documentation files.
-   [ ] **Documentation Accuracy:** Review all documentation (`*.md` files) to ensure they accurately reflect the current application state, architecture, and features, removing outdated information.

## Testing

-   [ ] **Increase Test Coverage:** Add more unit and integration tests, focusing on:
    -   `ToolEditor` validation logic.
    -   `ParameterDependency` conditional logic.
    -   `toolSpecService` functions.
    -   API interactions (using MSW).
-   [ ] **End-to-End Tests:** Consider adding basic E2E tests for critical user flows like creating, saving, and testing a tool.

## Dependencies

-   [ ] **Audit Dependencies:** Run `npm audit` regularly and address any reported vulnerabilities in project dependencies.
