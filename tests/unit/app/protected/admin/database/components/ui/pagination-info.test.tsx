import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { PaginationInfo } from '@src/app/protected/admin/database/components/ui/pagination-info';

describe('PaginationInfo', () => {
  it('renders pagination information correctly', () => {
    render(<PaginationInfo totalCount={100} currentPage={1} pageSize={20} itemLabel="users" />);

    expect(screen.getByText('100 total users')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('calculates total pages correctly', () => {
    render(<PaginationInfo totalCount={95} currentPage={3} pageSize={20} itemLabel="items" />);

    expect(screen.getByText('95 total items')).toBeInTheDocument();
    expect(screen.getByText('Page 3 of 5')).toBeInTheDocument();
  });

  it('handles single page correctly', () => {
    render(<PaginationInfo totalCount={15} currentPage={1} pageSize={20} itemLabel="posts" />);

    expect(screen.getByText('15 total posts')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
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

    expect(screen.getByText('12345 total records')).toBeInTheDocument();
    expect(screen.getByText('Page 50 of 124')).toBeInTheDocument();
  });

  it('handles different item labels', () => {
    render(<PaginationInfo totalCount={50} currentPage={2} pageSize={10} itemLabel="game logs" />);

    expect(screen.getByText('50 total game logs')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('handles last page correctly', () => {
    render(<PaginationInfo totalCount={100} currentPage={5} pageSize={20} itemLabel="items" />);

    expect(screen.getByText('100 total items')).toBeInTheDocument();
    expect(screen.getByText('Page 5 of 5')).toBeInTheDocument();
  });

  it('handles custom page sizes', () => {
    render(
      <PaginationInfo totalCount={1000} currentPage={10} pageSize={50} itemLabel="documents" />
    );

    expect(screen.getByText('1000 total documents')).toBeInTheDocument();
    expect(screen.getByText('Page 10 of 20')).toBeInTheDocument();
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

    const totalCountElement = screen.getByText('100 total users');
    const pageInfoElement = screen.getByText('Page 1 of 5');

    expect(totalCountElement).toHaveClass('text-sm', 'text-muted-foreground');
    expect(pageInfoElement).toHaveClass('text-sm', 'text-muted-foreground');
  });
});
