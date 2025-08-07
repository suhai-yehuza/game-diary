import { notFound } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { SimpleSportsPage } from '@/app/components/sports';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';
import SportPage from '@/app/sports/[sport]/page';

// Mock the modules using factory functions
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('@/app/components/sports', () => ({
  SimpleSportsPage: vi.fn().mockImplementation(({ children, ...props }) => (
    <div {...props} data-testid="simple-sports-page">
      {children}
    </div>
  )),
}));

describe('SportPage', () => {
  const mockNotFound = vi.mocked(notFound);
  const mockSimpleSportsPage = vi.mocked(SimpleSportsPage);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const firstSportKey = Object.keys(SPORTS_CONFIG)[0];

  it('renders the correct sport page when param is valid', async () => {
    // Call the async component function directly
    const result = await SportPage({ params: Promise.resolve({ sport: firstSportKey }) });

    // Verify the result is a valid React element
    expect(result).toBeDefined();
    expect(result.type).toBe(mockSimpleSportsPage);

    // Check that notFound was not called (valid sport)
    expect(mockNotFound).not.toHaveBeenCalled();
  });

  it('calls notFound when sport param is invalid', async () => {
    await SportPage({ params: Promise.resolve({ sport: 'invalidsport' }) });
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('renders nothing if param is missing', async () => {
    await SportPage({ params: Promise.resolve({ sport: '' }) });
    expect(mockNotFound).toHaveBeenCalled();
  });
});
