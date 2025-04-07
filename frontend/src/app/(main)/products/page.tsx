import { Metadata } from 'next';
import { ProductList } from '@/components/product/ProductList';
import api from '@/lib/api';

// Client-side components
import ProductFilters from './components/ProductFilters';

export const metadata: Metadata = {
  title: 'Products | Your eCommerce Store',
  description: 'Browse our collection of high-quality products for all your needs.',
  openGraph: {
    title: 'Products | Your eCommerce Store',
    description: 'Browse our collection of high-quality products for all your needs.',
    type: 'website',
    url: '/products',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
  },
};

async function getCategories() {
  try {
    const response = await api.get('/api/store/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categories = await getCategories();
  const selectedCategory = searchParams.category || null;
  
  // Generate Schema.org structured data
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: selectedCategory 
      ? categories?.find((c: {slug: string}) => c.slug === selectedCategory)?.name + ' Products' 
      : 'All Products',
    description: 'Browse our latest collection of high-quality products.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <div className="container py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar/Filter */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <ProductFilters 
                categories={categories} 
                selectedCategory={selectedCategory} 
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {selectedCategory
                  ? categories?.find((c: {slug: string}) => c.slug === selectedCategory)?.name || 'Products'
                  : 'All Products'}
              </h1>
              <p className="text-muted-foreground">
                Browse our latest collection of high-quality products.
              </p>
            </div>

            <ProductList categorySlug={selectedCategory || undefined} />
          </div>
        </div>
      </div>
    </>
  );
} 