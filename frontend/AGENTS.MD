
# BaaS Frontend - Project Instructions

## 1. Project Overview

This is the frontend for a Backend-as-a-Service
(BaaS) platform.

The backend is already implemented.
The frontend must integrate with the existing APIs.

Do not modify the backend unless explicitly asked.

## 2. Tech Stack

- React
- Vite
- JavaScript
- Redux Toolkit
- Axios
- React Router

Use the existing dependencies and project setup.
Do not install new libraries without approval.

## 3. Architecture

Follow feature-based architecture.

Organize features inside src/features/.

Keep responsibilities separate:
- components/: UI components
- api/: API request functions
- hooks/: Custom React hooks
- types/: Shared definitions when needed
- guards/: Route protection
- contexts/: Context providers when needed

Keep shared components and utilities reusable.
Avoid unnecessary abstractions.

## 4. Coding Rules

- Inspect existing code before making changes.
- Reuse existing files and patterns.
- Write clean, readable, maintainable code.
- Use functional React components and hooks.
- Keep API logic outside UI components.
- Avoid duplicate API functions.
- Do not create unnecessary files.
- Do not refactor unrelated code.
- Explain important decisions.

## 5. State Management

Use Redux Toolkit for shared application state.

Use createSlice for state management.
Use createAsyncThunk for asynchronous operations
when appropriate.

Keep authentication state in the auth feature.

Do not add another state management library
without approval.

## 6. API Integration

Use the existing Axios instance.

Keep API functions inside feature api folders.

Follow the backend API documentation exactly.

Do not invent endpoints, request fields,
response fields, or authentication behavior.

Handle loading, success, and error states.

Use credentials and token handling according
to the backend authentication contract.

Never store sensitive refresh tokens in localStorage.

## 7. Authentication

Authentication must follow the existing backend.

Use the correct login, registration, refresh,
and logout endpoints.

Respect HttpOnly cookie behavior.

Do not attempt to read HttpOnly cookies
from frontend JavaScript.

Handle expired sessions and unauthorized responses.

Protect authenticated routes using route guards.

## 8. UI and UX

Build responsive and accessible interfaces.

Include loading, error, and empty states.

Use reusable components where appropriate.

Keep the UI consistent across features.

Do not change the established design system
without approval.

## 9. AI Development Workflow

Before implementing a feature:

1. Inspect the relevant existing code.
2. Understand the requirements and API contract.
3. Create an implementation plan.
4. Identify files to create or modify.
5. Ask for clarification if important information
   is missing.

Implement one milestone at a time.

Do not proceed to unrelated features.

## 10. Testing and Verification

Run relevant tests after changes.

Run the available lint and build commands.

Do not claim tests passed unless they were run.

Report:
- Files created or modified
- Implementation summary
- Tests and commands executed
- Known issues or remaining work

Do not silently ignore failing tests.

## 11. Git Safety

Do not delete or overwrite existing work
without approval.

Do not commit or push unless explicitly asked.

Keep changes focused on the current task.