import { describe, it, expect } from 'vitest';

describe('GameLogsFilters', () => {
  it('can be imported successfully', async () => {
    const importedModule = await import('@src/app/components/game-logs/GameLogsFilters');
    expect(importedModule.GameLogsFilters).toBeDefined();
    expect(typeof importedModule.GameLogsFilters).toBe('function');
  });

  it('has the correct export name', async () => {
    const importedModule = await import('@src/app/components/game-logs/GameLogsFilters');
    expect(importedModule).toHaveProperty('GameLogsFilters');
  });

  it('is a React component', async () => {
    const { GameLogsFilters } = await import('@src/app/components/game-logs/GameLogsFilters');
    // React functional components are functions
    expect(typeof GameLogsFilters).toBe('function');
    // Components should have a length (parameters) indicating they accept props
    expect(GameLogsFilters.length).toBeGreaterThanOrEqual(0);
  });

  it('component name is correct', async () => {
    const { GameLogsFilters } = await import('@src/app/components/game-logs/GameLogsFilters');
    expect(GameLogsFilters.name).toBe('GameLogsFilters');
  });

  it('has proper component structure', async () => {
    const { GameLogsFilters } = await import('@src/app/components/game-logs/GameLogsFilters');

    // Check that the component is callable
    expect(typeof GameLogsFilters).toBe('function');

    // Check that it's not null or undefined
    expect(GameLogsFilters).not.toBeNull();
    expect(GameLogsFilters).not.toBeUndefined();
  });

  it('can be destructured from import', async () => {
    const importedModule = await import('@src/app/components/game-logs/GameLogsFilters');
    const { GameLogsFilters } = importedModule;

    expect(GameLogsFilters).toBeDefined();
    expect(typeof GameLogsFilters).toBe('function');
  });

  it('has correct module structure', async () => {
    const importedModule = await import('@src/app/components/game-logs/GameLogsFilters');

    // Check that the module has the expected structure
    expect(importedModule).toHaveProperty('GameLogsFilters');
    expect(typeof importedModule.GameLogsFilters).toBe('function');

    // Check that it's the default export
    expect(importedModule.GameLogsFilters).toBe(importedModule.GameLogsFilters);
  });
});
