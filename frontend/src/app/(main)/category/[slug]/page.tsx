import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import api from '@/lib/api';

// Client components
import { ProductList } from '@/components/product/ProductList';

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    // Fetch category data for SEO
    const response = await api.get(`/api/store/categories/${params.slug}/`);
    const category = response.data;
    
    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The requested category could not be found',
      };
    }
    
    // Use SEO optimized meta title and description if available, otherwise use defaults
    const title = category.meta_title || `${category.name} | Your eCommerce Store`;
    const description = category.meta_description || 
                       (category.description ? 
                         (category.description.length > 160 ? 
                           category.description.substring(0, 157) + '...' : 
                           category.description) : 
                         `Browse our collection of ${category.name} products`);
    
    // Construct the canonical URL
    const canonical = category.canonical_url || 
                    `${process.env.NEXT_PUBLIC_SITE_URL}/category/${params.slug}`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `/category/${params.slug}`,
      },
      alternates: {
        canonical,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Category | Your eCommerce Store',
      description: 'Browse our product categories',
    };
  }
}

async function getCategory(slug: string) {
  try {
    const response = await api.get(`/api/store/categories/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    notFound();
  }
  
  // Generate Schema.org structured data
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': category.schema_type || 'CollectionPage',
    name: category.name,
    description: category.description || `Browse our collection of ${category.name} products`,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${category.slug}`,
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <div className="container py-12">
        <div className="mb-6">
          <Link 
            href="/products" 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to all products
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>

          <ProductList categorySlug={params.slug} />
        </div>
      </div>
    </>
  );
} 