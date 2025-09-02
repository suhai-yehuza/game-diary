import { notFound } from 'next/navigation';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { SimpleSportsPage } from '@/app/components/sports';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';
import SportPage, { generateMetadata } from '@/app/sports/[sport]/page';

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

describe('generateMetadata', () => {
  const firstSportKey = Object.keys(SPORTS_CONFIG)[0];
  const firstSportConfig = SPORTS_CONFIG[firstSportKey as keyof typeof SPORTS_CONFIG];

  it('generates metadata for valid sport', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ sport: firstSportKey }) });

    expect(metadata).toEqual({
      title: firstSportConfig.name,
      description: firstSportConfig.description,
    });
  });

  it('generates fallback metadata for invalid sport', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ sport: 'invalidsport' }) });

    expect(metadata).toEqual({
      title: 'Sport Not Found - Game Diary',
      description: 'The requested sport could not be found',
    });
  });

  it('generates fallback metadata for empty sport', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ sport: '' }) });

    expect(metadata).toEqual({
      title: 'Sport Not Found - Game Diary',
      description: 'The requested sport could not be found',
    });
  });

  it('generates fallback metadata for undefined sport', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ sport: undefined as any }),
    });

    expect(metadata).toEqual({
      title: 'Sport Not Found - Game Diary',
      description: 'The requested sport could not be found',
    });
  });
});
