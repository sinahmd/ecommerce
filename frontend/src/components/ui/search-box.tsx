'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBoxProps {
  placeholder?: string;
  paramName?: string;
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
  defaultValue?: string;
  onSearch?: (query: string) => void;
}

export function SearchBox({
  placeholder = 'جستجو...',
  paramName = 'search',
  className = '',
  autoFocus = false,
  debounceMs = 300,
  defaultValue,
  onSearch,
}: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get the search query from URL or use defaultValue or empty string
  const initialQuery = defaultValue !== undefined ? defaultValue : (searchParams.get(paramName) || '');
  
  // Local state for the input value
  const [value, setValue] = useState(initialQuery);

  // Only update on mount or when defaultValue explicitly changes
  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue);
    }
  }, [defaultValue]);
  
  // Handle input change with debounce
  const updateSearchParam = (newValue: string) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // If using custom search handler, just call it
    if (onSearch) {
      timerRef.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
      return;
    }
    
    // Otherwise update URL params
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (newValue) {
        params.set(paramName, newValue);
      } else {
        params.delete(paramName);
      }
      
      // Reset to page 1 when search changes
      params.set('page', '1');
      
      // Update the URL
      router.push(`${pathname}?${params.toString()}`);
    }, debounceMs);
  };
  
  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Clear any pending timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (onSearch) {
      onSearch(value);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value) {
        params.set(paramName, value);
      } else {
        params.delete(paramName);
      }
      
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
  };
  
  // Clear search
  const handleClear = () => {
    setValue('');
    
    // Clear any pending timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (onSearch) {
      onSearch('');
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(paramName);
      params.set('page', '1');
      
      router.push(`${pathname}?${params.toString()}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} dir="rtl">
      <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          updateSearchParam(newValue);
        }}
        className="pr-9 pl-9 text-right"
        autoFocus={autoFocus}
        dir="rtl"
      />
      
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-0 h-full px-3 py-2"
          onClick={handleClear}
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">پاک کردن جستجو</span>
        </Button>
      )}
    </form>
  );
}