import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/app/components/ui/card';

describe('Card UI Components', () => {
  it('renders Card with children and custom class', () => {
    const { container } = render(
      <Card className="custom-card">
        <span>Card Content</span>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('custom-card');
  });

  it('renders CardHeader with children and custom class', () => {
    const { container } = render(
      <CardHeader className="header-class">
        <span>Header Content</span>
      </CardHeader>
    );
    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('header-class');
  });

  it('renders CardTitle with children and custom class', () => {
    const { container } = render(<CardTitle className="title-class">Test Title</CardTitle>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('title-class');
  });

  it('renders CardDescription with children and custom class', () => {
    const { container } = render(
      <CardDescription className="desc-class">Test Description</CardDescription>
    );
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('desc-class');
  });

  it('renders CardContent with children and custom class', () => {
    const { container } = render(
      <CardContent className="content-class">
        <span>Content Area</span>
      </CardContent>
    );
    expect(screen.getByText('Content Area')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('content-class');
  });

  it('renders CardFooter with children and custom class', () => {
    const { container } = render(
      <CardFooter className="footer-class">
        <span>Footer Area</span>
      </CardFooter>
    );
    expect(screen.getByText('Footer Area')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('footer-class');
  });
});
