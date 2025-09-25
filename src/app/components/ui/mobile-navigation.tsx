'use client';

import { Home, Users, Activity, Menu, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';

// Mobile bottom navigation
export const MobileBottomNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    currentPath?: string;
  }
>(({ className, currentPath, ...props }, ref) => {
  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      isActive: currentPath === '/',
    },
    {
      href: '/protected/dashboard',
      icon: Activity,
      label: 'Dashboard',
      isActive: currentPath?.startsWith('/protected/dashboard'),
    },
    {
      href: '/sports/nba',
      icon: Users,
      label: 'Sports',
      isActive: currentPath?.startsWith('/sports'),
    },
  ];

  return (
    <div
      ref={ref}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background border-t border-border',
        'safe-area-bottom',
        className
      )}
      {...props}
    >
      <nav className="flex items-center justify-around py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-h-[48px] min-w-[48px] px-2 py-1',
                'rounded-lg transition-colors duration-200',
                'hover:bg-muted active:bg-muted/80',
                {
                  'text-brand-primary': item.isActive,
                  'text-muted-foreground': !item.isActive,
                }
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
});
MobileBottomNav.displayName = 'MobileBottomNav';

// Mobile drawer navigation
export const MobileDrawer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }
>(({ className, isOpen, onClose, children, ...props }, ref) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        ref={ref}
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw]',
          'bg-background border-l border-border',
          'transform transition-transform duration-300 ease-in-out',
          {
            'translate-x-0': isOpen,
            'translate-x-full': !isOpen,
          },
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </>
  );
});
MobileDrawer.displayName = 'MobileDrawer';

// Mobile menu trigger
export const MobileMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen: boolean;
    onToggle: React.MouseEventHandler<HTMLButtonElement>;
  }
>(({ className, isOpen, onToggle, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="sm"
    onClick={onToggle}
    className={cn('h-8 w-8 p-0', className)}
    {...props}
  >
    {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
  </Button>
));
MobileMenuTrigger.displayName = 'MobileMenuTrigger';

// Mobile navigation links
export const MobileNavLinks = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    currentPath?: string;
    onLinkClick?: () => void;
  }
>(({ className, currentPath, onLinkClick, ...props }, ref) => {
  const navSections = [
    {
      title: 'Main',
      links: [
        { href: '/', label: 'Home', icon: Home },
        { href: '/protected/dashboard', label: 'Dashboard', icon: Activity },
      ],
    },
    {
      title: 'Sports',
      links: [
        { href: '/sports/nba', label: 'NBA', icon: Users },
        { href: '/sports/all-sports', label: 'All Sports', icon: Users },
      ],
    },
  ];

  return (
    <div ref={ref} className={cn('space-y-6', className)} {...props}>
      {navSections.map(section => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{section.title}</h3>
          <nav className="space-y-1">
            {section.links.map(link => {
              const Icon = link.icon;
              const isActive =
                currentPath === link.href ||
                (link.href !== '/' && currentPath?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg',
                    'transition-colors duration-200',
                    'hover:bg-muted active:bg-muted/80',
                    {
                      'bg-muted text-foreground': isActive,
                      'text-muted-foreground hover:text-foreground': !isActive,
                    }
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
});
MobileNavLinks.displayName = 'MobileNavLinks';
