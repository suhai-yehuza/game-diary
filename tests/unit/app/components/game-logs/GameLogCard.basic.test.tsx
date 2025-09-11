import { describe, it, expect } from 'vitest';

// This is a basic test to ensure the GameLogCard component can be imported
// More comprehensive tests can be added later once component dependencies are stable
describe('GameLogCard', () => {
  it('can be imported successfully', async () => {
    const importedModule = await import('@/app/components');
    expect(importedModule.GameLogCard).toBeDefined();
    // GameLogCard is a memoized component, so it's an object with a type property
    expect(typeof importedModule.GameLogCard).toBe('object');
  });

  it('has the correct export name', async () => {
    const importedModule = await import('@/app/components');
    expect(importedModule).toHaveProperty('GameLogCard');
  });

  it('is a React component', async () => {
    const { GameLogCard } = await import('@/app/components');
    // GameLogCard is a memoized component, so it's an object
    expect(typeof GameLogCard).toBe('object');
    // Memoized components have a type property that points to the actual component
    expect(GameLogCard.type).toBeDefined();
  });

  it('component name is correct', async () => {
    const { GameLogCard } = await import('@/app/components');
    // For memoized components, check the displayName property
    expect(GameLogCard.displayName).toBe('GameLogCard');
  });
});
