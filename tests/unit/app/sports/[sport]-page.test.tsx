import { render, screen } from '@testing-library/react';
import * as nextNavigation from 'next/navigation';
import React from 'react';
import { vi, describe, it, expect } from 'vitest';

import * as SportsComponents from '@/app/components/sports';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';
import SportPage from '@/app/sports/[sport]/page';

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<any>('next/navigation');
  return {
    ...actual,
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
  const mockNotFound = nextNavigation.notFound as unknown as ReturnType<typeof vi.fn>;
  const mockSimpleSportsPage = SportsComponents.SimpleSportsPage as unknown as ReturnType<
    typeof vi.fn
  >;

  const firstSportKey = Object.keys(SPORTS_CONFIG)[0];
  const firstSport = SPORTS_CONFIG[firstSportKey as keyof typeof SPORTS_CONFIG];

  it('renders the correct sport page when param is valid', () => {
    render(<SportPage params={{ sport: firstSportKey }} />);
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
    render(<SportPage params={{ sport: 'invalidsport' }} />);
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('renders nothing if param is missing', () => {
    render(<SportPage params={{ sport: '' }} />);
    expect(mockNotFound).toHaveBeenCalled();
  });
});
