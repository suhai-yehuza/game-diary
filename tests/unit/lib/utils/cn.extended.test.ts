import { describe, it, expect } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn utility Extended Tests', () => {
  describe('cn function', () => {
    it('combines multiple class names', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('handles conditional classes with boolean values', () => {
      expect(cn('base', 'conditional', '')).toBe('base conditional');
    });

    it('handles conditional classes with object syntax', () => {
      expect(cn('base', { conditional: true, hidden: false })).toBe('base conditional');
    });

    it('handles mixed input types', () => {
      expect(cn('base', 'conditional', { hidden: false, visible: true })).toBe(
        'base conditional visible'
      );
    });

    it('handles undefined values', () => {
      expect(cn('base', undefined, 'visible')).toBe('base visible');
    });

    it('handles null values', () => {
      expect(cn('base', null, 'visible')).toBe('base visible');
    });

    it('handles empty strings', () => {
      expect(cn('base', '', 'visible')).toBe('base visible');
    });

    it('handles arrays of classes', () => {
      expect(cn('base', ['class1', 'class2'], 'class3')).toBe('base class1 class2 class3');
    });

    it('handles nested arrays', () => {
      expect(cn('base', [['class1', 'class2'], 'class3'])).toBe('base class1 class2 class3');
    });

    it('handles complex conditional objects', () => {
      const isActive = true;
      const isDisabled = false;
      const size = 'large';

      expect(
        cn('base', {
          active: isActive,
          disabled: isDisabled,
          large: size === 'large',
        })
      ).toBe('base active large');
    });

    it('handles Tailwind class conflicts', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('handles spacing conflicts', () => {
      expect(cn('m-2', 'm-4')).toBe('m-4');
    });

    it('handles flex conflicts', () => {
      expect(cn('flex', 'inline-flex')).toBe('inline-flex');
    });

    it('handles color conflicts', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('handles background conflicts', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('handles border conflicts', () => {
      expect(cn('border-red-500', 'border-blue-500')).toBe('border-blue-500');
    });

    it('handles complex nested conditions', () => {
      const user = { role: 'admin', isActive: true };
      const theme = 'dark';

      expect(
        cn(
          'base',
          user.role === 'admin' && 'admin-only',
          user.isActive && 'active-user',
          theme === 'dark' && 'dark-theme'
        )
      ).toBe('base admin-only active-user dark-theme');
    });

    it('handles function calls that return classes', () => {
      const getSizeClass = (size: string) => (size === 'large' ? 'text-lg' : 'text-sm');
      const getColorClass = (color: string) => (color === 'red' ? 'text-red-500' : 'text-gray-500');

      expect(cn('base', getSizeClass('large'), getColorClass('red'))).toBe(
        'base text-lg text-red-500'
      );
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('handles single class', () => {
      expect(cn('single')).toBe('single');
    });

    it('handles all falsy values', () => {
      expect(cn(false, null, undefined, '')).toBe('');
    });

    it('handles mixed falsy and truthy values', () => {
      expect(cn(false, 'truthy', null, 'another', undefined)).toBe('truthy another');
    });

    it('handles objects with all false values', () => {
      expect(cn({ false1: false, false2: false })).toBe('');
    });

    it('handles objects with mixed boolean values', () => {
      expect(cn({ true1: true, false1: false, true2: true })).toBe('true1 true2');
    });

    it('handles complex nested arrays with conditions', () => {
      const condition1 = true;
      const condition2 = false;

      expect(
        cn('base', [condition1 && 'conditional1', condition2 && 'conditional2', 'always-present'])
      ).toBe('base conditional1 always-present');
    });

    it('handles deeply nested structures', () => {
      expect(cn('base', [['nested1', 'nested2'], 'level1', [['deep1', 'deep2'], 'level2']])).toBe(
        'base nested1 nested2 level1 deep1 deep2 level2'
      );
    });

    it('handles template literals', () => {
      const size = 'large';
      const color = 'red';

      expect(cn('base', `text-${size}`, `bg-${color}-500`)).toBe('base text-large bg-red-500');
    });

    it('handles dynamic class generation', () => {
      const status = 'success';
      const size = 'medium';

      const statusClasses = {
        success: 'text-green-500 bg-green-100',
        error: 'text-red-500 bg-red-100',
        warning: 'text-yellow-500 bg-yellow-100',
      };

      const sizeClasses = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
      };

      expect(
        cn(
          'base',
          statusClasses[status as keyof typeof statusClasses],
          sizeClasses[size as keyof typeof sizeClasses]
        )
      ).toBe('base text-green-500 bg-green-100 text-base');
    });
  });
});
