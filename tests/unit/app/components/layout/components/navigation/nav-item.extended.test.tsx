import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { NavItem } from '@/app/components/layout/components/navigation/NavItem';

describe('NavItem (extended)', () => {
  it('invokes onClick and closeMenu when stacked and active', () => {
    const onClick = vi.fn();
    const closeMenu = vi.fn();
    render(
      <NavItem href="/x" isActive={true} isStacked={true} onClick={onClick} closeMenu={closeMenu}>
        Link
      </NavItem>
    );
    const link = screen.getByText('Link');
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalled();
    expect(closeMenu).toHaveBeenCalled();
  });
});
