# Project Feature - Performance & Maintenance Concerns

Generated during code review on 2026-09-19

---

## 🔴 High Priority

### 1. Unused Variable - ESLint Error
**File:** `components/ProjectCard.jsx:25`
```javascript
function ProjectCardComponent({ project }) { ... }  // Never used
```
**Impact:** Build passes but lint fails; dead code confuses readers
**Fix:** Remove the unused `ProjectCardComponent` function (the exported `ProjectCard` uses `memo(ProjectCardComponent, ...)` but the component is actually the inline function)

---

## 🟡 Medium Priority

### 2. Empty State Objects Recreated Every Render
**File:** `hooks/useProject.js:169-210`
```javascript
const EMPTY_SINGLE_PROJECT = { ... }  // Created on every useProject() call
const EMPTY_SDK_CONFIG = { ... }
const EMPTY_PROJECT_CONFIG = { ... }
const EMPTY_API_KEYS = { ... }
```
**Impact:** New object references on every render → unnecessary re-renders in consuming components
**Fix:** Move outside component or wrap with `useMemo(() => ({...}), [])`

### 3. Duplicate Masking Logic
**Files:** 
- `components/ProjectCard.jsx:19-23` → `maskApiKey()`
- `components/ApiKeyListModal.jsx:13-17` → `maskKey()`
**Impact:** Two nearly identical functions; maintenance burden
**Fix:** Extract to shared utility: `src/features/project/utils/maskKey.js`

### 4. Silent No-Op in updateProjectConfig
**File:** `state/projectSlice.js:323-325`
```javascript
if (state.currentProject) {
  state.currentProject.config = action.payload;
}
```
**Impact:** If `currentProject` not loaded, config update succeeds but local state not updated → UI stale
**Fix:** Always update or dispatch fetchProjectConfig after update

---

## 🟢 Low Priority

### 5. Verbose Memo Comparison
**File:** `components/ProjectCard.jsx:221-234`
```javascript
export const ProjectCard = memo(ProjectCard, (prevProps, nextProps) => {
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.name === nextProps.project.name &&
    // ... 8 more field comparisons
  );
});
```
**Impact:** Verbose, error-prone when fields change
**Fix:** Use `shallowEqual` from `react-redux` or `useMemo` for derived data

### 6. Hardcoded Error Codes
**File:** `state/projectSlice.js:4-19`
```javascript
const ERROR_MESSAGES = {
  PROJECT_EXISTS: '...',
  PROJECT_LIMIT: '...',
  // ...
};
```
**Impact:** Backend error codes duplicated in frontend; drift risk
**Fix:** Extract to shared constants or generate from OpenAPI spec

### 7. Assumption on API Response Shape
**File:** `components/CreateApiKeyModal.jsx:39`
```javascript
if (result.success && result.data?.api_key) { ... }
```
**Impact:** No validation if backend changes `data` structure
**Fix:** Add runtime validation or TypeScript types with strict checks

### 8. No Test Coverage
**Entire feature:** 0 test files found
**Impact:** No regression protection for:
- Async thunk success/error paths
- Hook behavior with mocked dispatch
- Component interactions (modal triggers, form validation)
**Fix:** Add test files:
- `state/projectSlice.test.js`
- `hooks/useProject.test.js`
- `components/ProjectCard.test.jsx`
- `components/CreateProjectModal.test.jsx`

### 9. Early Return Objects Not Memoized
**File:** `hooks/useProject.js:169-210`
The empty state objects returned on missing `projectId` are new objects each call
**Impact:** Consumers using `useMemo`/`React.memo` will re-render unnecessarily
**Fix:** Define constants outside hook or use `useMemo`

---

## 📋 Suggested Refactor Order

1. **Remove unused `ProjectCardComponent`** (fixes lint error)
2. **Extract `maskKey` utility** (eliminates duplication)
3. **Move empty state objects outside hook** (stops re-renders)
4. **Add test files** (enables safe refactoring)
5. **Simplify `ProjectCard` memo** (reduces maintenance)
6. **Centralize error codes** (reduces drift)
7. **Add response validation** (catches backend changes)

---

## 🔍 Additional Observations

- All modals correctly use portal pattern with backdrop handling
- Accessibility attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`) present
- React Hook Form usage consistent with `mode: 'onBlur'`
- Build production passes (1.16s, 419KB JS bundle)
- No circular dependencies detected in feature folder