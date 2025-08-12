import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { MenuProvider, useMenuContext } from '@/app/components/providers/MenuContext';

function Consumer() {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  return (
    <div>
      <span data-testid="expanded">{isMenuExpanded ? 'yes' : 'no'}</span>
      <button onClick={() => setIsMenuExpanded(!isMenuExpanded)}>toggle</button>
    </div>
  );
}

describe('MenuContext (extended)', () => {
  it('provides default values when no provider present', () => {
    render(<Consumer />);
    expect(screen.getByTestId('expanded').textContent).toBe('no');
    // clicking without provider should not throw
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('expanded').textContent).toBe('no');
  });

  it('toggles menu state within provider', () => {
    render(
      <MenuProvider>
        <Consumer />
      </MenuProvider>
    );
    const indicator = screen.getByTestId('expanded');
    expect(indicator.textContent).toBe('no');
    fireEvent.click(screen.getByText('toggle'));
    expect(indicator.textContent).toBe('yes');
  });
});
