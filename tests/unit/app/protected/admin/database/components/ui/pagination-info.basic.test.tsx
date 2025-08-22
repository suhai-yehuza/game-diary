import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { PaginationInfo } from '@src/app/protected/admin/database/components/ui/pagination-info';

describe('PaginationInfo', () => {
  it('renders pagination information correctly', () => {
    render(<PaginationInfo totalCount={100} currentPage={1} pageSize={20} itemLabel="users" />);

    expect(screen.getByText('1-20 of 100 total users')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    const elements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('of 5') ?? false;
    });
    expect(elements.length).toBeGreaterThan(0);
  });

  it('calculates total pages correctly', () => {
    render(<PaginationInfo totalCount={95} currentPage={3} pageSize={20} itemLabel="items" />);

    expect(screen.getByText('41-60 of 95 total items')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    const elements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('of 5') ?? false;
    });
    expect(elements.length).toBeGreaterThan(0);
  });

  it('handles single page correctly', () => {
    render(<PaginationInfo totalCount={15} currentPage={1} pageSize={20} itemLabel="posts" />);

    expect(screen.getByText('1-15 of 15 total posts')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    const elements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('of 1') ?? false;
    });
    expect(elements.length).toBeGreaterThan(0);
  });

  it('handles zero total count', () => {
    const { container } = render(
      <PaginationInfo totalCount={0} currentPage={1} pageSize={20} itemLabel="users" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles large numbers correctly', () => {
    render(
      <PaginationInfo totalCount={12345} currentPage={50} pageSize={100} itemLabel="records" />
    );

    expect(screen.getByText('4901-5000 of 12.35K total records')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    const elements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('of 124') ?? false;
    });
    expect(elements.length).toBeGreaterThan(0);
  });

  it('handles different item labels', () => {
    render(<PaginationInfo totalCount={50} currentPage={2} pageSize={10} itemLabel="game logs" />);

    expect(screen.getByText('11-20 of 50 total game logs')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    const elements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('of 5') ?? false;
    });
    expect(elements.length).toBeGreaterThan(0);
  });

  it('handles last page correctly', () => {
    render(<PaginationInfo totalCount={100} currentPage={5} pageSize={20} itemLabel="items" />);

    expect(screen.getByText('81-100 of 100 total items')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    const elements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('of 5') ?? false;
    });
    expect(elements.length).toBeGreaterThan(0);
  });

  it('handles custom page sizes', () => {
    render(
      <PaginationInfo totalCount={1000} currentPage={10} pageSize={50} itemLabel="documents" />
    );

    expect(screen.getByText('451-500 of 1.00K total documents')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    const elements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('of 20') ?? false;
    });
    expect(elements.length).toBeGreaterThan(0);
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <PaginationInfo totalCount={100} currentPage={1} pageSize={20} itemLabel="users" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-between', 'mb-4');
  });

  it('renders with correct text styling', () => {
    render(<PaginationInfo totalCount={100} currentPage={1} pageSize={20} itemLabel="users" />);

    const totalCountElement = screen.getByText('1-20 of 100 total users');
    const currentPageElement = screen.getByText('1');

    expect(totalCountElement).toHaveClass('text-sm', 'text-muted-foreground');
    expect(currentPageElement).toHaveClass(
      'font-semibold',
      'text-emerald-600',
      'dark:text-emerald-400'
    );
  });
});
