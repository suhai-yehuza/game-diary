import { useState, useEffect, useMemo } from 'react';

import type { IUseResponsivePaginationOptions, IPaginationState } from '@/types';

export function useResponsivePagination<T>(items: T[], options: IUseResponsivePaginationOptions) {
  const {
    totalItems,
    minItemsPerPage = 10,
    maxItemsPerPage = 50,
    breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1440,
      large: 1920,
    },
  } = options;

  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Calculate optimal items per page based on viewport
  const itemsPerPage = useMemo(() => {
    const { width, height } = viewport;

    // Define grid columns for different breakpoints
    const gridColumns = {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      large: 4,
    };

    // Base calculation on screen dimensions
    let calculatedItems = Math.floor((width * height) / 50000); // Rough area-based calculation

    // Apply breakpoint-based adjustments
    if (width < breakpoints.mobile) {
      // Mobile: 1-2 columns, smaller items
      calculatedItems = Math.max(minItemsPerPage, Math.floor(calculatedItems * 0.6));
    } else if (width < breakpoints.tablet) {
      // Tablet: 2-3 columns
      calculatedItems = Math.max(minItemsPerPage, Math.floor(calculatedItems * 0.8));
    } else if (width < breakpoints.desktop) {
      // Desktop: 3-4 columns
      calculatedItems = Math.max(minItemsPerPage, Math.floor(calculatedItems * 1.0));
    } else if (width < breakpoints.large) {
      // Large desktop: 4+ columns
      calculatedItems = Math.max(minItemsPerPage, Math.floor(calculatedItems * 1.2));
    } else {
      // Extra large: maximize items
      calculatedItems = Math.max(minItemsPerPage, Math.min(maxItemsPerPage, calculatedItems * 1.4));
    }

    // Ensure within bounds
    let finalItems = Math.max(minItemsPerPage, Math.min(maxItemsPerPage, calculatedItems));

    // Ensure grid-friendly numbers to avoid gaps
    let targetColumns: number;
    if (width < breakpoints.mobile) {
      targetColumns = gridColumns.mobile;
    } else if (width < breakpoints.tablet) {
      targetColumns = gridColumns.tablet;
    } else if (width < breakpoints.desktop) {
      targetColumns = gridColumns.desktop;
    } else {
      targetColumns = gridColumns.large;
    }

    // Round up to the nearest multiple of target columns to avoid gaps
    finalItems = Math.ceil(finalItems / targetColumns) * targetColumns;

    // Ensure we don't exceed maxItemsPerPage
    return Math.min(maxItemsPerPage, finalItems);
  }, [viewport, breakpoints, minItemsPerPage, maxItemsPerPage]);

  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Calculate pagination values
  const paginationState = useMemo((): IPaginationState<T> => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentPage,
      itemsPerPage,
      totalPages,
      startIndex,
      endIndex,
      currentItems,
    };
  }, [items, currentPage, itemsPerPage, totalItems]);

  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add debounced resize listener
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);

    // Initial calculation
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Navigation functions
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationState.totalPages));
    setCurrentPage(validPage);

    // Scroll to top when page changes
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < paginationState.totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(paginationState.totalPages);

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    ...paginationState,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
    viewport,
  };
}
