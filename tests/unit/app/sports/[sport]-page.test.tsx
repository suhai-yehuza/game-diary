import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import SportPage from '@/app/sports/[sport]/page';
import * as nextNavigation from 'next/navigation';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';
import * as SportsComponents from '@/app/components/sports';

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<any>('next/navigation');
  return {
    ...actual,
    useParams: vi.fn(),
    notFound: vi.fn(),
  };
});

vi.mock('@/app/components/sports', async () => {
  const actual = await vi.importActual<any>('@/app/components/sports');
  return {
    ...actual,
    SimpleSportsPage: vi.fn(({ title, description, children }) => (
      <div data-testid="simple-sports-page">
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    )),
  };
});

describe('SportPage', () => {
  const mockUseParams = nextNavigation.useParams as unknown as ReturnType<typeof vi.fn>;
  const mockNotFound = nextNavigation.notFound as unknown as ReturnType<typeof vi.fn>;
  const mockSimpleSportsPage = SportsComponents.SimpleSportsPage as unknown as ReturnType<
    typeof vi.fn
  >;

  const firstSportKey = Object.keys(SPORTS_CONFIG)[0];
  const firstSport = SPORTS_CONFIG[firstSportKey as keyof typeof SPORTS_CONFIG];
  const secondSportKey = Object.keys(SPORTS_CONFIG)[1];
  const secondSport = SPORTS_CONFIG[secondSportKey as keyof typeof SPORTS_CONFIG];

  it('renders the correct sport page when param is valid', () => {
    mockUseParams.mockReturnValue({ sport: firstSportKey });
    render(<SportPage />);
    expect(mockSimpleSportsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: firstSport.name,
        description: firstSport.description,
      }),
      undefined
    );
    expect(screen.getByText(`Welcome to the ${firstSport.fullName}`)).toBeInTheDocument();
  });

  it('calls notFound when sport param is invalid', () => {
    mockUseParams.mockReturnValue({ sport: 'invalidsport' });
    render(<SportPage />);
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('handles array param and uses first value', () => {
    mockUseParams.mockReturnValue({ sport: [secondSportKey, firstSportKey] });
    render(<SportPage />);
    // The first call is for the firstSportKey, the second call is for the secondSportKey
    expect(mockSimpleSportsPage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: secondSport.name,
        description: secondSport.description,
      }),
      undefined
    );
    expect(screen.getByText(`Welcome to the ${secondSport.fullName}`)).toBeInTheDocument();
  });

  it('renders nothing if param is missing', () => {
    mockUseParams.mockReturnValue({});
    render(<SportPage />);
    expect(mockNotFound).toHaveBeenCalled();
  });
});
