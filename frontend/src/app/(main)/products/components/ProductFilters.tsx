"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Category } from '@/types/product';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
}

export default function ProductFilters({ categories, selectedCategory }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryChange = (categorySlug: string | null) => {
    if (categorySlug) {
      router.push(`${pathname}?category=${categorySlug}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-4">دسته‌بندی‌ها</h3>
      <div className="space-y-2">
        <button
          className={`w-full text-right px-3 py-2 rounded-md hover:bg-accent ${
            selectedCategory === null ? 'bg-accent text-accent-foreground' : ''
          }`}
          onClick={() => handleCategoryChange(null)}
        >
          همه محصولات
        </button>
        {categories?.map((category) => (
          <button
            key={category.slug}
            className={`w-full text-right px-3 py-2 rounded-md hover:bg-accent ${
              selectedCategory === category.slug
                ? 'bg-accent text-accent-foreground'
                : ''
            }`}
            onClick={() => handleCategoryChange(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
} 