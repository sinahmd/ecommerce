import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getFullImageUrl } from '@/lib/utils';
import api from '@/lib/api';

// Client-side components
import ProductAddToCart from './components/ProductAddToCart';

// Define schema type with additionalProperty
type ProductSchema = {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image: string[];
  sku: string;
  mpn: string;
  brand?: {
    '@type': string;
    name: string;
  };
  offers: {
    '@type': string;
    url: string;
    priceCurrency: string;
    price: number;
    availability: string;
    itemCondition: string;
  };
  additionalProperty?: Array<{
    '@type': string;
    name: string;
    value: string;
  }>;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    // Fetch the product data for SEO metadata
    const response = await api.get(`/api/store/products/by-slug/${params.slug}/`);
    const product = response.data;

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found',
      };
    }

    // Use SEO optimized meta title and description if available, otherwise use defaults
    const title = product.meta_title || `${product.name} | Your eCommerce Store`;
    const description = product.meta_description || product.description.substring(0, 160);

    // Construct the canonical URL
    const canonical = product.canonical_url || 
      `${process.env.NEXT_PUBLIC_SITE_URL}/product/${params.slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `/product/${params.slug}`,
        images: product.image ? [{ url: getFullImageUrl(product.image) }] : [],
      },
      alternates: {
        canonical,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | Your eCommerce Store',
      description: 'View our product details',
    };
  }
}

async function getProduct(slug: string) {
  try {
    const response = await api.get(`/api/store/products/by-slug/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  // Extract category info with consistent fallback logic
  const getCategoryInfo = () => {
    if (!product) return { name: '', slug: '' };
    
    const name = product.primary_category?.name || 
                (product.category_names && product.category_names[0]) || 
                (product.category?.name) || 
                '';
                
    const slug = product.primary_category?.slug || 
                (product.category_slugs && product.category_slugs[0]) || 
                (product.category?.slug) || 
                '';
                
    return { name, slug };
  };

  // Generate Schema.org structured data
  const schemaData: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': product.schema_type || 'Product',
    name: product.name,
    description: product.description,
    image: product.image ? [getFullImageUrl(product.image)] : [],
    sku: product.sku || '',
    mpn: product.mpn || '',
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };

  if (product.weight || product.dimensions) {
    schemaData.additionalProperty = [];
    
    if (product.weight) {
      schemaData.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'weight',
        value: product.weight
      });
    }

    if (product.dimensions) {
      schemaData.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'dimensions',
        value: product.dimensions
      });
    }
  }

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
            Back to products
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Product Image */}
          <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
            {product.image ? (
              <Image
                src={getFullImageUrl(product.image)}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-medium">{product.name[0]}</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center mt-2">
                {getCategoryInfo().name ? (
                  <Link 
                    href={`/category/${getCategoryInfo().slug}`}
                    className="text-muted-foreground hover:underline"
                  >
                    {getCategoryInfo().name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Uncategorized</span>
                )}
              </div>
            </div>

            <div className="text-2xl font-bold">${product.price}</div>

            <div className="prose">
              <p>{product.description}</p>
            </div>

            {/* Client component for cart functionality */}
            <ProductAddToCart product={product} />

            {/* Product details section */}
            {(product.brand || product.sku || product.weight || product.dimensions) && (
              <div className="border-t pt-6 mt-8">
                <h3 className="font-semibold mb-3">Product Details</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {product.brand && (
                    <>
                      <dt className="text-muted-foreground">Brand:</dt>
                      <dd>{product.brand}</dd>
                    </>
                  )}
                  {product.sku && (
                    <>
                      <dt className="text-muted-foreground">SKU:</dt>
                      <dd>{product.sku}</dd>
                    </>
                  )}
                  {product.weight && (
                    <>
                      <dt className="text-muted-foreground">Weight:</dt>
                      <dd>{product.weight}</dd>
                    </>
                  )}
                  {product.dimensions && (
                    <>
                      <dt className="text-muted-foreground">Dimensions:</dt>
                      <dd>{product.dimensions}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 