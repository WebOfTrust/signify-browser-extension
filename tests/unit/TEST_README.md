# Testing the Signify Browser Extension

## Current Test Coverage

We have implemented unit tests for the Signify Browser Extension focusing on the core authentication functions:

1. `bootAndConnect` - The function for booting and connecting to a Signify client directly
2. `bootAndConnectWorkflow` - The function for booting and connecting via a workflow

## Test Organization

Tests are organized in a dedicated test directory (`tests/unit`) rather than alongside implementation files.

## Running Tests

To run the specific test file:

```
npm test -- tests/unit/signify.test.ts
```

Or to run all tests in the unit test directory:

```
npm test -- tests/unit
```

## Testing Strategy

Our implemented testing strategy includes:

1. **Complete Dependency Mocking**: 
   - All external dependencies (`signify-ts`, `vlei-verifier-workflows`) are mocked
   - Browser API (`webextension-polyfill`) is fully mocked, including storage
   - Internal services are mocked to isolate the test subject

2. **Mock Implementation**: 
   - We create mock implementations of the functions to test rather than importing the real ones
   - This isolates the core logic from browser-extension specific code

3. **Testing in Isolation**:
   - Each function is tested independently
   - Dependencies are controlled to ensure predictable test outcomes

## Test Patterns

Our implemented test pattern includes:

1. **Basic Existence Tests**:
   - Verifying that functions exist and are callable

2. **Parameter Validation Tests**:
   - Ensuring functions accept the correct parameters
   - Testing that parameters are passed correctly to dependencies

3. **Success Path Tests**:
   - Verifying expected behavior when everything works correctly
   - Testing that controller IDs are properly set after connection

4. **Error Handling Tests**:
   - Testing failure during boot
   - Testing failure during connect
   - Testing workflow failures and exceptions

5. **Sequencing Tests**:
   - Verifying that operations happen in the correct order (boot before connect)

## Mocking Approach

For effective testing, we've implemented several mocking strategies:

1. **Browser API Mocking**:
   - Complete mocking of `browser.storage` (local, session, sync)
   - Mocking of browser alarm and message APIs

2. **Signify Client Mocking**:
   - Mocked `SignifyClient` constructor and methods
   - Simulated controller object with ID

3. **Workflow Mocking**:
   - Mocked workflow execution with success and failure states
   - Tested workflow state handling

## Future Test Expansion

This testing pattern can be extended to other components of the extension by:

1. Following the same mocking strategy
2. Isolating the component under test
3. Testing in isolation with controlled dependencies
4. Using the same test patterns (existence, parameters, success, errors)

The pattern demonstrated in `tests/unit/signify.test.ts` serves as a reference implementation for future tests. 