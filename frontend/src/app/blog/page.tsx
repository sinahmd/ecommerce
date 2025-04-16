import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getBlogPosts, getTags } from '@/lib/blog-service';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { SearchBox } from '@/components/ui/search-box';

export const metadata: Metadata = {
  title: 'Blog | Your eCommerce Store',
  description: 'Read our latest articles on eCommerce, marketing, and product tips.',
  openGraph: {
    title: 'Blog | Your eCommerce Store',
    description: 'Read our latest articles on eCommerce, marketing, and product tips.',
    type: 'website',
    url: '/blog',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog`,
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { 
    tag?: string; 
    search?: string;
    page?: string;
    page_size?: string;
  };
}) {
  // Get parameters from URL
  const tag = searchParams.tag;
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = parseInt(searchParams.page_size || '8', 10);
  
  // Fetch blog posts with pagination
  const { posts, total_items, total_pages, current_page, page_size } = await getBlogPosts({
    tag,
    search,
    page,
    page_size: pageSize as 4 | 8 | 16 | 32
  });
  
  const tags = await getTags();

  const breadcrumbItems = [
    { title: 'Home', link: '/' },
    { title: 'Blog', link: '/blog', isCurrentPage: true },
  ];

  // Check if we have any filters active
  const hasActiveFilters = tag || search;

  if (posts.length === 0 && !hasActiveFilters) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-3xl font-bold mb-8">Blog</h1>
        <div className="flex flex-wrap gap-4 mb-8">
          {tags.map((tag) => (
            <Link href={`/blog?tag=${tag.slug}`} key={tag.id}>
              <Badge variant={searchParams.tag === tag.slug ? 'default' : 'outline'}>
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
        <p className="text-center py-12">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          {tag && (
            <p className="text-muted-foreground mt-2">
              Showing posts tagged with &ldquo;{tags.find(t => t.slug === tag)?.name || tag}&rdquo;
            </p>
          )}
        </div>
        
        {hasActiveFilters && (
          <Link href="/blog" className="text-sm text-blue-600 hover:underline">
            Clear all filters
          </Link>
        )}
      </div>
      
      {/* Search and tag filters */}
      <div className="mb-8 space-y-6">
        <SearchBox 
          placeholder="Search blog posts..." 
          className="max-w-md"
        />
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link href={`/blog?tag=${tag.slug}`} key={tag.id}>
              <Badge variant={searchParams.tag === tag.slug ? 'default' : 'outline'}>
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-4">No blog posts found matching your filters.</p>
          <Link href="/blog" className="text-blue-600 hover:underline">
            View all blog posts
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-full h-48">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex gap-2 mb-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {post.excerpt || post.content?.substring(0, 120) + '...'}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <time dateTime={post.created_at}>
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </time>
                    <span className="text-blue-600 group-hover:underline">Read more</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-12">
            <Pagination 
              totalPages={total_pages} 
              currentPage={current_page} 
              pageSize={page_size}
              totalItems={total_items}
            />
          </div>
        </>
      )}
    </div>
  );
} 