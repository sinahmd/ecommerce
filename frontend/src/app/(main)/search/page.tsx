"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductList } from '@/components/product/ProductList';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useProducts } from '@/hooks/useProducts';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentQuery, setCurrentQuery] = useState(initialQuery);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { products, isLoading, totalPages } = useProducts({
    search: currentQuery,
    sortBy: sortBy as 'relevance' | 'price_low_high' | 'price_high_low' | 'newest',
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    page: currentPage,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentQuery(searchQuery);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  useEffect(() => {
    setSearchQuery(initialQuery);
    setCurrentQuery(initialQuery);
  }, [initialQuery]);
  
  return (
    <div className="container py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">
          {currentQuery 
            ? `Search results for "${currentQuery}"`
            : 'همه محصولات'
          }
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search with these filters
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sort by</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                      <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">Price Range</h3>
                      <p className="text-sm text-muted-foreground">
                        ${priceRange[0]} - ${priceRange[1]}
                      </p>
                    </div>
                    <Slider 
                      defaultValue={priceRange} 
                      min={0} 
                      max={1000} 
                      step={10}
                      onValueChange={(value) => setPriceRange(value as number[])}
                      className="py-4"
                    />
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => setCurrentPage(1)}>
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium mb-2">No products found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setCurrentQuery('');
              setPriceRange([0, 1000]);
              setSortBy('relevance');
              setCurrentPage(1);
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-muted-foreground mb-6">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
            <ProductList products={products} />
            
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 