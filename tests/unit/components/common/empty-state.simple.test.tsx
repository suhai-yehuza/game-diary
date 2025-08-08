import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import {
  EmptyState,
  PageEmptyState,
  CardEmptyState,
  NoDataEmptyState,
  NoResultsEmptyState,
} from '@/app/components/common/EmptyState';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className: string }) => (
    <div data-testid="alert-circle" className={className}>
      AlertCircle
    </div>
  ),
  Search: ({ className }: { className: string }) => (
    <div data-testid="search-icon" className={className}>
      Search
    </div>
  ),
  FileText: ({ className }: { className: string }) => (
    <div data-testid="file-text-icon" className={className}>
      FileText
    </div>
  ),
}));

describe('EmptyState Simple Tests', () => {
  describe('EmptyState', () => {
    it('renders with title', () => {
      render(<EmptyState title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders with title and description', () => {
      render(<EmptyState title="Test Title" description="Test Description" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('renders with custom icon', () => {
      render(<EmptyState title="Test Title" icon={<div data-testid="custom-icon">Custom Icon</div>} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders with action', () => {
      render(<EmptyState title="Test Title" action={<button>Test Action</button>} />);
      expect(screen.getByRole('button', { name: 'Test Action' })).toBeInTheDocument();
    });
  });

  describe('PageEmptyState', () => {
    it('renders with title', () => {
      render(<PageEmptyState title="Page Title" />);
      expect(screen.getByText('Page Title')).toBeInTheDocument();
    });

    it('renders with title and description', () => {
      render(<PageEmptyState title="Page Title" description="Page Description" />);
      expect(screen.getByText('Page Title')).toBeInTheDocument();
      expect(screen.getByText('Page Description')).toBeInTheDocument();
    });
  });

  describe('CardEmptyState', () => {
    it('renders with title', () => {
      render(<CardEmptyState title="Card Title" />);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders with title and description', () => {
      render(<CardEmptyState title="Card Title" description="Card Description" />);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
    });
  });

  describe('NoDataEmptyState', () => {
    it('renders with default message', () => {
      render(<NoDataEmptyState />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<NoDataEmptyState title="Custom no data title" />);
      expect(screen.getByText('Custom no data title')).toBeInTheDocument();
    });
  });

  describe('NoResultsEmptyState', () => {
    it('renders with default message', () => {
      render(<NoResultsEmptyState />);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<NoResultsEmptyState title="Custom no results title" />);
      expect(screen.getByText('Custom no results title')).toBeInTheDocument();
    });
  });
});
