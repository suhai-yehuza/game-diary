import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';
import type { ISelectProps } from '@/types';

const Select = React.forwardRef<HTMLButtonElement, ISelectProps>(
  ({ className, children, placeholder, value, onValueChange, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(value || '');
    const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleSelect = (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
      setIsOpen(false);
    };

    // Update button position when dropdown opens
    React.useEffect(() => {
      if (isOpen && buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    }, [isOpen]);

    const selectedChild = React.Children.toArray(children).find(
      child =>
        React.isValidElement(child) && (child.props as { value?: string }).value === selectedValue
    );

    return (
      <div className="relative">
        <button
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(props as any)}
          ref={node => {
            buttonRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            'flex items-center justify-between text-sm disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          onClick={() => {
            if (!disabled) {
              console.log('Toggle dropdown, current state:', isOpen);
              setIsOpen(!isOpen);
            }
          }}
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
        {isOpen &&
          buttonRect &&
          createPortal(
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
              {/* Dropdown */}
              <div
                className="fixed z-[9999] max-h-60 overflow-auto rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xl"
                style={{
                  top: buttonRect.bottom + window.scrollY + 4,
                  left: buttonRect.left + window.scrollX,
                  width: buttonRect.width,
                  minWidth: '200px',
                }}
              >
                {React.Children.map(children, child => {
                  if (React.isValidElement(child)) {
                    const childProps = child.props as { value?: string };
                    if (typeof childProps.value === 'string') {
                      console.log('Rendering item:', childProps.value);
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
            </>,
            document.body
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
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-3 px-4 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150',
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
