import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import type { ISelectProps } from '@/types';

const Select = React.forwardRef<HTMLButtonElement, ISelectProps>(
  ({ className, children, placeholder, value, onValueChange, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(value || '');

    const handleSelect = (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
      setIsOpen(false);
    };

    const selectedChild = React.Children.toArray(children).find(
      child =>
        React.isValidElement(child) && (child.props as { value?: string }).value === selectedValue
    );

    return (
      <div className="relative">
        <button
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(props as any)}
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          {...props}
        >
          <span className={selectedValue ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedChild
              ? React.isValidElement(selectedChild) &&
                (selectedChild.props as { children?: React.ReactNode }).children
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                const childProps = child.props as { value?: string };
                if (typeof childProps.value === 'string') {
                  return React.cloneElement(
                    child as React.ReactElement<{ value: string; onClick?: () => void }>,
                    {
                      onClick: () => handleSelect(childProps.value || ''),
                    }
                  );
                }
              }
              return child;
            })}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<HTMLButtonElement, ISelectProps>(
  ({ className, children, ...props }, ref) => (
    <Select ref={ref} className={className} {...props}>
      {children}
    </Select>
  )
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('p-1', className)} {...props}>
    {children}
  </div>
));
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  { value: string; children: React.ReactNode; className?: string; onClick?: () => void }
>(({ className, children, value: _value, onClick, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = 'SelectItem';

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  { placeholder?: string; children?: React.ReactNode }
>(({ placeholder, children, ...props }, ref) => (
  <span ref={ref} {...props}>
    {children || placeholder}
  </span>
));
SelectValue.displayName = 'SelectValue';

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
