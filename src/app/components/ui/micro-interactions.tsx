'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

// Hover animation component
export const HoverAnimation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    scale?: number;
    duration?: number;
    children: React.ReactNode;
  }
>(({ className, scale = 1.05, duration = 200, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'transition-transform duration-200 ease-in-out',
      'hover:scale-105 active:scale-95',
      className
    )}
    style={
      {
        '--hover-scale': scale,
        '--animation-duration': `${duration}ms`,
      } as React.CSSProperties
    }
    {...props}
  >
    {children}
  </div>
));
HoverAnimation.displayName = 'HoverAnimation';

// Ripple effect component
export const RippleEffect = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }
>(({ className, children, onClick, ...props }, ref) => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={cn('relative overflow-hidden', 'transition-colors duration-200', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear',
          }}
        />
      ))}
    </button>
  );
});
RippleEffect.displayName = 'RippleEffect';

// Stagger animation component
export const StaggerAnimation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    stagger?: number;
    delay?: number;
    children: React.ReactNode;
  }
>(({ className, stagger = 100, delay = 0, children, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn('transition-all duration-300 ease-out', {
            'opacity-100 translate-y-0': isVisible,
            'opacity-0 translate-y-4': !isVisible,
          })}
          style={{
            transitionDelay: isVisible ? `${index * stagger}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
});
StaggerAnimation.displayName = 'StaggerAnimation';

// Pulse animation component
export const PulseAnimation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    duration?: number;
    children: React.ReactNode;
  }
>(({ className, duration = 1000, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('animate-pulse', className)}
    style={{
      animationDuration: `${duration}ms`,
    }}
    {...props}
  >
    {children}
  </div>
));
PulseAnimation.displayName = 'PulseAnimation';

// Bounce animation component
export const BounceAnimation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('animate-bounce', className)} {...props}>
    {children}
  </div>
));
BounceAnimation.displayName = 'BounceAnimation';

// Shake animation component
export const ShakeAnimation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    trigger?: boolean;
  }
>(({ className, children, trigger = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'transition-transform duration-200',
      {
        'animate-shake': trigger,
      },
      className
    )}
    {...props}
  >
    {children}
  </div>
));
ShakeAnimation.displayName = 'ShakeAnimation';

// Fade in animation component
export const FadeIn = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    delay?: number;
    duration?: number;
    children: React.ReactNode;
  }
>(({ className, delay = 0, duration = 300, children, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-opacity duration-300 ease-out',
        {
          'opacity-100': isVisible,
          'opacity-0': !isVisible,
        },
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
});
FadeIn.displayName = 'FadeIn';

// Slide in animation component
export const SlideIn = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
    children: React.ReactNode;
  }
>(({ className, direction = 'up', delay = 0, duration = 300, children, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-4';
      case 'down':
        return '-translate-y-4';
      case 'left':
        return 'translate-x-4';
      case 'right':
        return '-translate-x-4';
      default:
        return 'translate-y-4';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-300 ease-out',
        {
          'opacity-100 translate-y-0 translate-x-0': isVisible,
          [`opacity-0 ${getTransform()}`]: !isVisible,
        },
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
});
SlideIn.displayName = 'SlideIn';
