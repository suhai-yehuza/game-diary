import { render, screen } from '@testing-library/react';

import { Logo } from '@/app/components/layout/components/Logo';

describe('Logo component extended', () => {
  it('returns null when menu is expanded', () => {
    const { container } = render(<Logo isMenuExpanded={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders logo image when menu is not expanded', () => {
    render(<Logo isMenuExpanded={false} />);
    const img = screen.getByAltText('Placeholder Logo');
    expect(img).toBeInTheDocument();
  });
});
