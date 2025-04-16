'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  siblingCount?: number;
  className?: string;
}

export function Pagination({
  totalPages,
  currentPage,
  pageSize,
  totalItems,
  pageSizeOptions = [4, 8, 16, 32],
  siblingCount = 1,
  className = '',
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback((params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    // Apply all params from the params object
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });
    
    return newSearchParams.toString();
  }, [searchParams]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    const queryString = createQueryString({ page: page.toString() });
    router.push(`${pathname}?${queryString}`);
  }, [createQueryString, currentPage, pathname, router, totalPages]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize: string) => {
    const size = parseInt(newSize);
    if (!pageSizeOptions.includes(size)) return;
    
    // When changing page size, go back to page 1
    const queryString = createQueryString({ 
      page_size: size.toString(),
      page: '1'
    });
    
    router.push(`${pathname}?${queryString}`);
  }, [createQueryString, pageSizeOptions, pathname, router]);

  // Generate page numbers to show - memoized to avoid recalculation
  const pages = useMemo(() => {
    // If there are fewer than 7 pages, show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate range with dots
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Always show first and last page
    if (shouldShowLeftDots && shouldShowRightDots) {
      // Show dots on both sides
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, '...', ...middleRange, '...', totalPages];
    } else if (shouldShowLeftDots) {
      // Show dots on left side only
      const rightRange = Array.from(
        { length: 4 },
        (_, i) => totalPages - 3 + i
      );
      return [1, '...', ...rightRange];
    } else if (shouldShowRightDots) {
      // Show dots on right side only
      const leftRange = Array.from(
        { length: 4 },
        (_, i) => i + 1
      );
      return [...leftRange, '...', totalPages];
    }
    
    // This shouldn't happen but just in case
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages, currentPage, siblingCount]);

  // Determine showing info text (e.g., "Showing 1-10 of 100")
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${className}`}>
      {/* Page size selector and info */}
      <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Show</span>
          <Select 
            defaultValue={pageSize.toString()} 
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-muted-foreground">
          Showing {startItem}-{endItem} of {totalItems} items
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          
          {pages.map((page, i) => (
            page === '...' ? (
              <div key={`ellipsis-${i}`} className="px-3 py-1.5 text-sm">
                ...
              </div>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page as number)}
              >
                {page}
              </Button>
            )
          ))}
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      )}
    </div>
  );
}