"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ProductList } from '@/components/product/ProductList';
import { useCategories, useProducts } from '@/hooks/useProducts';

export default function HomePage() {
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  // Fetch trending products
  const { products: trendingProducts } = useProducts({
    page: 1,
    page_size: 4,
    sortBy: 'newest'
  });

  return (
    <div className="space-y-16 pt-10 pb-20">
      {/* Hero Section */}
      <section className="relative">
        <div className="container">
          <div className="rounded-xl bg-muted px-6 py-20 md:py-32 text-center">
            <div className="mx-auto max-w-3xl space-y-6">
              <h1 className="text-4xl font-bold md:text-6xl">استایل خود را پیدا کنید</h1>
              <p className="text-lg text-muted-foreground md:text-xl">
              مجموعه انتخاب شده ما از آخرین روندهای مد و لوازم جانبی را کاوش کنید
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
                <Button asChild size="lg">
                  <Link href="/products">حالا خرید کنید</Link>
                </Button>
                {/* <Button asChild variant="outline" size="lg">
                  <Link href="/category/clothing">مشاهده محصولات</Link>
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">خرید بر اساس دسته بندی</h2>
          <Link href="/categories" className="flex items-center text-primary hover:underline">
            <span>همه دسته بندی ها</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoriesLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
            ))
          ) : (
            // Actual categories
            categories?.slice(0, 3).map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-lg"
              >
                <div className="h-64 bg-muted flex items-center justify-center">
                  <span className="text-2xl font-semibold">{category.name}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="secondary">خرید از {category.name}</Button>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container">
        <div className="rounded-xl bg-muted p-8 md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">عضویت در خبرنامه</h2>
            <p className="mt-2 text-muted-foreground">
              دریافت اطلاع رسانی از جدیدترین محصولات و جشن های امروز
            </p>
            <div className="mt-6 flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="ایمیل خود را وارد کنید"
                className="flex-1 rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
              <Button className="rounded-l-none">عضویت</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}