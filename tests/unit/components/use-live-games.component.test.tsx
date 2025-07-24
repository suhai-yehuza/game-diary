import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLiveGames } from '@/hooks/use-live-games';

function TestComponent() {
  const { games } = useLiveGames();
  return <div>Games: {games ? games.length : 0}</div>;
}

describe('useLiveGames in component', () => {
  it('renders without crashing', () => {
    render(<TestComponent />);
    expect(screen.getByText(/Games:/)).toBeInTheDocument();
  });
});
