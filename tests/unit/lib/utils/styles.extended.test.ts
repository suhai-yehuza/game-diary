import { describe, it, expect } from 'vitest';

import {
  buttonVariants,
  inputVariants,
  cardVariants,
  loadingStates,
  navStyles,
  tableStyles,
  formStyles,
  layoutStyles,
  statusStyles,
  getButtonClass,
  getInputClass,
  getCardClass,
  getNavLinkClass,
  getTableRowClass,
  getTableCellClass,
  getStatusClass,
} from '@/lib/utils/styles';

describe('Styles Utils Extended Tests', () => {
  describe('buttonVariants', () => {
    it('has all expected button variants', () => {
      expect(buttonVariants.primary).toBeDefined();
      expect(buttonVariants.secondary).toBeDefined();
      expect(buttonVariants.danger).toBeDefined();
      expect(buttonVariants.success).toBeDefined();
      expect(buttonVariants.outline).toBeDefined();
      expect(buttonVariants.ghost).toBeDefined();
      expect(buttonVariants.small).toBeDefined();
      expect(buttonVariants.large).toBeDefined();
    });

    it('button variants contain expected CSS classes', () => {
      expect(buttonVariants.primary).toContain('bg-blue-800');
      expect(buttonVariants.secondary).toContain('bg-gray-200');
      expect(buttonVariants.danger).toContain('bg-red-600');
      expect(buttonVariants.success).toContain('bg-green-600');
    });
  });

  describe('inputVariants', () => {
    it('has all expected input variants', () => {
      expect(inputVariants.default).toBeDefined();
      expect(inputVariants.search).toBeDefined();
      expect(inputVariants.large).toBeDefined();
    });

    it('input variants contain expected CSS classes', () => {
      expect(inputVariants.default).toContain('border-input');
      expect(inputVariants.search).toContain('border-input');
      expect(inputVariants.large).toContain('border-input');
    });
  });

  describe('cardVariants', () => {
    it('has all expected card variants', () => {
      expect(cardVariants.default).toBeDefined();
      expect(cardVariants.elevated).toBeDefined();
      expect(cardVariants.interactive).toBeDefined();
    });

    it('card variants contain expected CSS classes', () => {
      expect(cardVariants.default).toContain('rounded-lg');
      expect(cardVariants.elevated).toContain('shadow-lg');
      expect(cardVariants.interactive).toContain('cursor-pointer');
    });
  });

  describe('loadingStates', () => {
    it('has all expected loading states', () => {
      expect(loadingStates.skeleton).toBeDefined();
      expect(loadingStates.spinner).toBeDefined();
      expect(loadingStates.pulse).toBeDefined();
    });

    it('loading states contain expected CSS classes', () => {
      expect(loadingStates.skeleton).toContain('animate-pulse');
      expect(loadingStates.spinner).toContain('animate-spin');
      expect(loadingStates.pulse).toContain('animate-pulse');
    });
  });

  describe('navStyles', () => {
    it('has all expected nav styles', () => {
      expect(navStyles.link).toBeDefined();
      expect(navStyles.activeLink).toBeDefined();
      expect(navStyles.inactiveLink).toBeDefined();
      expect(navStyles.mobileLink).toBeDefined();
    });

    it('nav styles contain expected CSS classes', () => {
      expect(navStyles.link).toContain('transition-colors');
      expect(navStyles.activeLink).toContain('text-blue-600');
      expect(navStyles.inactiveLink).toContain('hover:text-blue-600');
    });
  });

  describe('tableStyles', () => {
    it('has all expected table styles', () => {
      expect(tableStyles.container).toBeDefined();
      expect(tableStyles.header).toBeDefined();
      expect(tableStyles.cell).toBeDefined();
      expect(tableStyles.row).toBeDefined();
      expect(tableStyles.indexCell).toBeDefined();
    });

    it('table styles contain expected CSS classes', () => {
      expect(tableStyles.container).toContain('rounded-lg');
      expect(tableStyles.header).toContain('bg-gray-50');
      expect(tableStyles.cell).toContain('px-6');
    });
  });

  describe('formStyles', () => {
    it('has all expected form styles', () => {
      expect(formStyles.label).toBeDefined();
      expect(formStyles.error).toBeDefined();
      expect(formStyles.help).toBeDefined();
      expect(formStyles.group).toBeDefined();
      expect(formStyles.field).toBeDefined();
    });

    it('form styles contain expected CSS classes', () => {
      expect(formStyles.label).toContain('text-sm');
      expect(formStyles.error).toContain('text-red-600');
      expect(formStyles.help).toContain('text-gray-500');
    });
  });

  describe('layoutStyles', () => {
    it('has all expected layout styles', () => {
      expect(layoutStyles.container).toBeDefined();
      expect(layoutStyles.section).toBeDefined();
      expect(layoutStyles.title).toBeDefined();
      expect(layoutStyles.subtitle).toBeDefined();
      expect(layoutStyles.divider).toBeDefined();
    });

    it('layout styles contain expected CSS classes', () => {
      expect(layoutStyles.container).toContain('container');
      expect(layoutStyles.title).toContain('text-3xl');
      expect(layoutStyles.subtitle).toContain('text-gray-600');
    });
  });

  describe('statusStyles', () => {
    it('has all expected status styles', () => {
      expect(statusStyles.success).toBeDefined();
      expect(statusStyles.error).toBeDefined();
      expect(statusStyles.warning).toBeDefined();
      expect(statusStyles.info).toBeDefined();
    });

    it('status styles contain expected CSS classes', () => {
      expect(statusStyles.success).toContain('bg-green-100');
      expect(statusStyles.error).toContain('bg-red-100');
      expect(statusStyles.warning).toContain('bg-yellow-100');
      expect(statusStyles.info).toContain('bg-blue-100');
    });
  });

  describe('getButtonClass', () => {
    it('returns button class with variant', () => {
      const result = getButtonClass('primary');
      expect(result).toContain('bg-blue-800');
      expect(result).toContain('text-white');
    });

    it('combines variant with additional className', () => {
      const result = getButtonClass('primary', 'custom-class');
      expect(result).toContain('bg-blue-800');
      expect(result).toContain('custom-class');
    });
  });

  describe('getInputClass', () => {
    it('returns input class with variant', () => {
      const result = getInputClass('default');
      expect(result).toContain('border-input');
      expect(result).toContain('bg-background');
    });

    it('combines variant with additional className', () => {
      const result = getInputClass('default', 'custom-class');
      expect(result).toContain('border-input');
      expect(result).toContain('custom-class');
    });
  });

  describe('getCardClass', () => {
    it('returns card class with variant', () => {
      const result = getCardClass('default');
      expect(result).toContain('rounded-lg');
      expect(result).toContain('border');
    });

    it('combines variant with additional className', () => {
      const result = getCardClass('default', 'custom-class');
      expect(result).toContain('rounded-lg');
      expect(result).toContain('custom-class');
    });
  });

  describe('getNavLinkClass', () => {
    it('returns active link class', () => {
      const result = getNavLinkClass(true);
      expect(result).toContain('text-blue-600');
      expect(result).toContain('font-semibold');
    });

    it('returns inactive link class', () => {
      const result = getNavLinkClass(false);
      expect(result).toContain('hover:text-blue-600');
    });

    it('handles mobile links', () => {
      const result = getNavLinkClass(false, true);
      expect(result).toContain('w-[90vw]');
    });
  });

  describe('getTableRowClass', () => {
    it('returns table row class', () => {
      const result = getTableRowClass();
      expect(result).toContain('transition-all');
    });

    it('combines with additional className', () => {
      const result = getTableRowClass('custom-class');
      expect(result).toContain('transition-all');
      expect(result).toContain('custom-class');
    });
  });

  describe('getTableCellClass', () => {
    it('returns table cell class', () => {
      const result = getTableCellClass();
      expect(result).toContain('px-6');
      expect(result).toContain('py-4');
    });

    it('combines with additional className', () => {
      const result = getTableCellClass('custom-class');
      expect(result).toContain('px-6');
      expect(result).toContain('custom-class');
    });
  });

  describe('getStatusClass', () => {
    it('returns status class for success', () => {
      const result = getStatusClass('success');
      expect(result).toContain('bg-green-100');
      expect(result).toContain('text-green-800');
    });

    it('returns status class for error', () => {
      const result = getStatusClass('error');
      expect(result).toContain('bg-red-100');
      expect(result).toContain('text-red-800');
    });

    it('combines with additional className', () => {
      const result = getStatusClass('success', 'custom-class');
      expect(result).toContain('bg-green-100');
      expect(result).toContain('custom-class');
    });
  });
});
