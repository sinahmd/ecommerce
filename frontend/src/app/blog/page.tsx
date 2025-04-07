import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { getBlogPosts, getTags } from '@/lib/blog-service';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';

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
  searchParams: { tag?: string };
}) {
  const tag = searchParams.tag;
  const posts = await getBlogPosts(tag);
  const tags = await getTags();

  const breadcrumbItems = [
    { title: 'Home', link: '/' },
    { title: 'Blog', link: '/blog', isCurrentPage: true },
  ];

  if (posts.length === 0) {
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
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog</h1>
        {searchParams.tag && (
          <Link href="/blog" className="text-sm text-blue-600 hover:underline">
            Clear filter
          </Link>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 mb-8">
        {tags.map((tag) => (
          <Link href={`/blog?tag=${tag.slug}`} key={tag.id}>
            <Badge variant={searchParams.tag === tag.slug ? 'default' : 'outline'}>
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>

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
    </div>
  );
} 