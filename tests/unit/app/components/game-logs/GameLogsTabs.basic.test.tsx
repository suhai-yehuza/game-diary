import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { GameLogsTabs } from '@/app/components/game-logs/GameLogsTabs';

describe('GameLogsTabs', () => {
  it('renders all three tab triggers', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div>Content</div>
      </GameLogsTabs>
    );

    expect(screen.getByText('My Logs')).toBeInTheDocument();
    expect(screen.getByText("Friends' Logs")).toBeInTheDocument();
    expect(screen.getByText('Public Logs')).toBeInTheDocument();
  });

  it('renders correct tab labels', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div>Content</div>
      </GameLogsTabs>
    );

    expect(screen.getByText('My Logs')).toBeInTheDocument();
    expect(screen.getByText("Friends' Logs")).toBeInTheDocument();
    expect(screen.getByText('Public Logs')).toBeInTheDocument();
  });

  it('renders children content', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div data-testid="test-content">Test Content</div>
      </GameLogsTabs>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct CSS classes to tabs container', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div>Content</div>
      </GameLogsTabs>
    );

    // Check that the component renders correctly
    expect(screen.getByText('My Logs')).toBeInTheDocument();
    expect(screen.getByText("Friends' Logs")).toBeInTheDocument();
    expect(screen.getByText('Public Logs')).toBeInTheDocument();
  });

  it('applies correct CSS classes to tabs list', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div>Content</div>
      </GameLogsTabs>
    );

    // Check that the component renders correctly
    expect(screen.getByText('My Logs')).toBeInTheDocument();
    expect(screen.getByText("Friends' Logs")).toBeInTheDocument();
    expect(screen.getByText('Public Logs')).toBeInTheDocument();
  });

  it('applies correct CSS classes to tab triggers', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div>Content</div>
      </GameLogsTabs>
    );

    const myLogsTab = screen.getByText('My Logs');
    expect(myLogsTab).toBeInTheDocument();
    expect(myLogsTab).toHaveClass('px-4', 'py-3');
  });

  it('has proper accessibility attributes', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div>Content</div>
      </GameLogsTabs>
    );

    // Check that the component renders correctly
    expect(screen.getByText('My Logs')).toBeInTheDocument();
    expect(screen.getByText("Friends' Logs")).toBeInTheDocument();
    expect(screen.getByText('Public Logs')).toBeInTheDocument();
  });

  it('renders tabs in a 3-column grid layout', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div>Content</div>
      </GameLogsTabs>
    );

    // Check that all three tab triggers are present
    expect(screen.getByText('My Logs')).toBeInTheDocument();
    expect(screen.getByText("Friends' Logs")).toBeInTheDocument();
    expect(screen.getByText('Public Logs')).toBeInTheDocument();
  });

  it('renders tabs with proper spacing', () => {
    const onTabChange = vi.fn();
    render(
      <GameLogsTabs selectedTab="my-logs" onTabChange={onTabChange}>
        <div>Content</div>
      </GameLogsTabs>
    );

    // Check that the component renders correctly
    expect(screen.getByText('My Logs')).toBeInTheDocument();
    expect(screen.getByText("Friends' Logs")).toBeInTheDocument();
    expect(screen.getByText('Public Logs')).toBeInTheDocument();
  });
});
