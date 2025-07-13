import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import HomePage from '@src/app/page';
import { MenuProvider } from '@/app/components/providers';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, priority, sizes, 'aria-hidden': ariaHidden }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-priority={priority}
      data-sizes={sizes}
      aria-hidden={ariaHidden}
    />
  ),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MenuProvider>{children}</MenuProvider>
);

vi.mock('next/link', () => ({
  default: ({ href, children, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

describe('HomePage', () => {
  it('renders the home page with correct structure', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Placeholder Text Here')).toBeInTheDocument();

    // Check for description
    expect(screen.getByText('Placeholder sentence or paragraph here')).toBeInTheDocument();

    // Check for main action button
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toBeInTheDocument();
  });

  it('renders the logo image correctly', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const logo = screen.getByAltText('Game Diary Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logos/gamelog-large.svg');
    expect(logo).toHaveAttribute('width', '200');
    expect(logo).toHaveAttribute('height', '50');
    expect(logo).toHaveAttribute('data-priority', 'true');
    expect(logo).toHaveAttribute('data-sizes', '(max-width: 600px) 150px, 200px');
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    // Check for main section with grid layout
    const section = container.querySelector('section');
    expect(section).toHaveClass(
      'grid',
      'grid-rows-[20px_1fr_20px]',
      'items-center',
      'justify-items-center',
      'min-h-screen',
      'p-8',
      'pb-20',
      'gap-16',
      'sm:p-20',
      'font-[family-name:var(--font-geist-sans)]'
    );

    // Check for main content container
    const mainContainer = section?.querySelector('.flex.flex-col');
    expect(mainContainer).toHaveClass(
      'flex',
      'flex-col',
      'gap-[32px]',
      'row-start-2',
      'items-center',
      'justify-center',
      'text-center',
      'max-w-3xl'
    );
  });

  it('has proper semantic structure', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    // Check for heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');

    // Check for paragraph
    const paragraph = screen.getByText('Placeholder sentence or paragraph here');
    expect(paragraph.tagName).toBe('P');

    // Check for section element
    const section = heading.closest('section');
    expect(section).toBeInTheDocument();

    // Check for footer
    const footer = section?.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('applies correct styling to heading', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-4xl', 'font-bold', 'tracking-tight');
  });

  it('applies correct styling to description', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const description = screen.getByText('Placeholder sentence or paragraph here');
    expect(description).toHaveClass('text-xl', 'text-gray-600', 'dark:text-gray-300');
  });

  it('renders the dashboard link correctly', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const dashboardLink = screen.getByRole('link', { name: 'Go to Dashboard' });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/protected/user');
    expect(dashboardLink).toHaveClass(
      'px-6',
      'py-3',
      'bg-blue-600',
      'text-white',
      'rounded-lg',
      'hover:bg-blue-700',
      'transition-colors'
    );
  });

  it('renders footer links correctly', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    // Check for "Placeholder 01" link
    const howToLink = screen.getByRole('link', { name: 'Placeholder 01' });
    expect(howToLink).toBeInTheDocument();
    expect(howToLink).toHaveAttribute('href', '/');

    // Check for "Placeholder 02" link
    const exampleLink = screen.getByRole('link', { name: 'Placeholder 02' });
    expect(exampleLink).toBeInTheDocument();
    expect(exampleLink).toHaveAttribute('href', '/');
  });

  it('renders footer icons correctly', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    // Check for file icon
    const fileIcon = screen.getByAltText('File icon');
    expect(fileIcon).toBeInTheDocument();
    expect(fileIcon).toHaveAttribute('src', '/icons/file.svg');
    expect(fileIcon).toHaveAttribute('width', '16');
    expect(fileIcon).toHaveAttribute('height', '16');
    expect(fileIcon).toHaveAttribute('data-sizes', '16px');
    expect(fileIcon).toHaveAttribute('aria-hidden', 'true');

    // Check for window icon
    const windowIcon = screen.getByAltText('Window icon');
    expect(windowIcon).toBeInTheDocument();
    expect(windowIcon).toHaveAttribute('src', '/icons/window.svg');
    expect(windowIcon).toHaveAttribute('width', '16');
    expect(windowIcon).toHaveAttribute('height', '16');
    expect(windowIcon).toHaveAttribute('data-sizes', '16px');
    expect(windowIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders consistently', () => {
    const { rerender } = render(<HomePage />, { wrapper: TestWrapper });

    // Re-render and check consistency
    rerender(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Placeholder Text Here')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();

    // Check that the page has a logical structure
    const mainContainer = heading.closest('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();

    // Check that footer icons are hidden from screen readers
    const fileIcon = screen.getByAltText('File icon');
    const windowIcon = screen.getByAltText('Window icon');
    expect(fileIcon).toHaveAttribute('aria-hidden', 'true');
    expect(windowIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles multiple renders without issues', () => {
    const { rerender, unmount } = render(<HomePage />, { wrapper: TestWrapper });

    // Multiple re-renders
    rerender(<HomePage />);
    rerender(<HomePage />);
    rerender(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Placeholder Text Here')).toBeInTheDocument();

    // Clean unmount and remount
    unmount();
    render(<HomePage />, { wrapper: TestWrapper });

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Placeholder Text Here')).toBeInTheDocument();
  });

  it('takes full viewport height', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    const section = container.querySelector('section');
    expect(section).toHaveClass('min-h-screen');
  });

  it('has proper content structure', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    // Check that content is properly contained
    const section = container.querySelector('section');
    const mainContainer = section?.querySelector('.flex.flex-col');
    const logoContainer = mainContainer?.querySelector('.flex.flex-col');
    const footer = section?.querySelector('footer');

    expect(section).toBeInTheDocument();
    expect(mainContainer).toBeInTheDocument();
    expect(logoContainer).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });

  it('has proper grid layout', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    const section = container.querySelector('section');
    expect(section).toHaveClass('grid', 'grid-rows-[20px_1fr_20px]');
  });

  it('has proper responsive design classes', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    const section = container.querySelector('section');
    expect(section).toHaveClass('p-8', 'sm:p-20');
  });

  it('renders Game Diary specific content', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    // Check for Game Diary specific text
    expect(screen.getByText('Placeholder Text Here')).toBeInTheDocument();
    expect(screen.getByText('Placeholder sentence or paragraph here')).toBeInTheDocument();
    expect(screen.getByText('Placeholder 01')).toBeInTheDocument();
    expect(screen.getByText('Placeholder 02')).toBeInTheDocument();
  });

  it('has proper text hierarchy', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const heading = screen.getByRole('heading', { level: 1 });
    const description = screen.getByText('Placeholder sentence or paragraph here');

    // Check that heading comes before description
    expect(
      heading.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('maintains consistent styling across renders', () => {
    const { rerender } = render(<HomePage />, { wrapper: TestWrapper });

    // Get initial styling
    const initialHeading = screen.getByRole('heading', { level: 1 });
    const initialDescription = screen.getByText('Placeholder sentence or paragraph here');
    const initialButton = screen.getByRole('link', { name: 'Go to Dashboard' });

    // Re-render
    rerender(<HomePage />);

    // Check that styling is maintained
    const newHeading = screen.getByRole('heading', { level: 1 });
    const newDescription = screen.getByText('Placeholder sentence or paragraph here');
    const newButton = screen.getByRole('link', { name: 'Go to Dashboard' });

    expect(newHeading).toHaveClass('text-4xl', 'font-bold', 'tracking-tight');
    expect(newDescription).toHaveClass('text-xl', 'text-gray-600', 'dark:text-gray-300');
    expect(newButton).toHaveClass(
      'px-6',
      'py-3',
      'bg-blue-600',
      'text-white',
      'rounded-lg',
      'hover:bg-blue-700',
      'transition-colors'
    );
  });

  it('has proper document structure', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    // Check that the component renders as expected in the document
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    // Check for main content area
    const mainContainer = section?.querySelector('.flex.flex-col');
    expect(mainContainer).toBeInTheDocument();

    // Check for footer
    const footer = section?.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('has proper button styling and hover effects', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const button = screen.getByRole('link', { name: 'Go to Dashboard' });
    expect(button).toHaveClass('hover:bg-blue-700', 'transition-colors');
  });

  it('has proper footer link styling', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    const howToLink = screen.getByRole('link', { name: 'Placeholder 01' });
    const exampleLink = screen.getByRole('link', { name: 'Placeholder 02' });

    expect(howToLink).toHaveClass('hover:underline', 'hover:underline-offset-4');
    expect(exampleLink).toHaveClass('hover:underline', 'hover:underline-offset-4');
  });

  it('has proper font family', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    const section = container.querySelector('section');
    expect(section).toHaveClass('font-[family-name:var(--font-geist-sans)]');
  });

  it('has proper spacing and layout', () => {
    const { container } = render(<HomePage />, { wrapper: TestWrapper });

    const section = container.querySelector('section');
    expect(section).toHaveClass('gap-16', 'p-8', 'pb-20');

    const mainContainer = section?.querySelector('.flex.flex-col');
    expect(mainContainer).toHaveClass('gap-[32px]');
  });
});
