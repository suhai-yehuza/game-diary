import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Skeleton } from './skeleton';

// Progressive loading step component
export const LoadingStep = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    status: 'pending' | 'loading' | 'completed' | 'error';
    title: string;
    description?: string;
  }
>(({ className, status, title, description, ...props }, ref) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loading':
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        );
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'loading':
        return 'text-brand-primary';
      case 'error':
        return 'text-destructive';
      case 'pending':
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'transition-all duration-200',
        {
          'bg-green-50 border border-green-200': status === 'completed',
          'bg-blue-50 border border-blue-200': status === 'loading',
          'bg-red-50 border border-red-200': status === 'error',
          'bg-muted/50': status === 'pending',
        },
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0">{getStatusIcon()}</div>

      <div className="flex-1 min-w-0">
        <h4 className={cn('text-sm font-medium', getStatusColor())}>{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
});
LoadingStep.displayName = 'LoadingStep';

// Progressive loading container
export const ProgressiveLoading = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    steps: Array<{
      id: string;
      title: string;
      description?: string;
      status: 'pending' | 'loading' | 'completed' | 'error';
    }>;
    title?: string;
    description?: string;
  }
>(({ className, steps, title, description, ...props }, ref) => {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div ref={ref} className={cn('w-full max-w-md mx-auto', className)} {...props}>
      {(title || description) && (
        <div className="text-center mb-6">
          {title && <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>
            {completedSteps}/{totalSteps}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-brand-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map(step => (
          <LoadingStep
            key={step.id}
            status={step.status}
            title={step.title}
            description={step.description}
          />
        ))}
      </div>
    </div>
  );
});
ProgressiveLoading.displayName = 'ProgressiveLoading';

// Skeleton with progressive reveal
export const ProgressiveSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    items: number;
    delay?: number;
    stagger?: number;
  }
>(({ className, items, delay = 0, stagger = 100, ...props }, ref) => {
  const [visibleItems, setVisibleItems] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleItems(prev => {
          if (prev >= items) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, stagger);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [items, delay, stagger]);

  return (
    <div ref={ref} className={cn('space-y-3', className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={`skeleton-${Math.random()}`}
          className={cn('transition-opacity duration-300', {
            'opacity-100': index < visibleItems,
            'opacity-0': index >= visibleItems,
          })}
        >
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
});
ProgressiveSkeleton.displayName = 'ProgressiveSkeleton';

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

// Lazy loading component
export const LazyLoad = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    threshold?: number;
  }
>(({ className, children, fallback, threshold = 0.1, ...props }, ref) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(elementRef as React.RefObject<HTMLElement>, {
    threshold,
  });

  React.useEffect(() => {
    if (isIntersecting && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isIntersecting, isLoaded]);

  return (
    <div
      ref={node => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
        elementRef.current = node;
      }}
      className={className}
      {...props}
    >
      {isLoaded ? children : fallback}
    </div>
  );
});
LazyLoad.displayName = 'LazyLoad';
