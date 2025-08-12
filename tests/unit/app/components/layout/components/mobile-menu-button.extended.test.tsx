import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { MobileMenuButton } from '@/app/components/layout/components/MobileMenuButton';

describe('MobileMenuButton (extended)', () => {
  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<MobileMenuButton onToggle={onToggle} />);
    const btn = screen.getByTestId('mobile-menu-button');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalled();
  });
});
