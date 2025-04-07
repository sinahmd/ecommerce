import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { getBlogPost, getBlogPosts } from '@/lib/blog-service';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';

// Use generateStaticParams to specify which blog posts should be
// generated at build time vs. on-demand at request time
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await getBlogPost(params.slug);
    
    return {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      openGraph: {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        type: 'article',
        url: `/blog/${post.slug}`,
        images: post.cover_image ? [{ url: post.cover_image }] : [],
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
        tags: post.tags.map(tag => tag.name),
      },
      alternates: {
        canonical: post.canonical_url || `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Blog Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  // Fetch blog post data
  let post;
  try {
    post = await getBlogPost(params.slug);
  } catch (error) {
    return notFound();
  }

  const breadcrumbItems = [
    { title: 'Home', link: '/' },
    { title: 'Blog', link: '/blog' },
    { title: post.title, link: `/blog/${post.slug}`, isCurrentPage: true },
  ];

  // JSON-LD structured data for this article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : [],
    datePublished: post.created_at,
    dateModified: post.updated_at,
    keywords: post.tags.map(tag => tag.name).join(', '),
    author: {
      '@type': 'Organization',
      name: 'Your eCommerce Store',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your eCommerce Store',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <article className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
          {post.cover_image && (
            <div className="relative w-full h-[400px]">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                priority
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link href={`/blog?tag=${tag.slug}`} key={tag.id}>
                    <Badge variant="outline">{tag.name}</Badge>
                  </Link>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {post.title}
              </h1>
              
              <div className="text-gray-500 text-sm">
                <time dateTime={post.created_at}>
                  Published on {format(new Date(post.created_at), 'MMMM d, yyyy')}
                </time>
                {post.updated_at !== post.created_at && (
                  <span> · Updated on {format(new Date(post.updated_at), 'MMMM d, yyyy')}</span>
                )}
              </div>
            </header>
            
            {post.excerpt && (
              <div className="text-lg text-gray-600 mb-8 font-medium italic border-l-4 border-gray-200 pl-4">
                {post.excerpt}
              </div>
            )}
            
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
            </div>
            
            <div className="mt-12 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Share this article</h3>
              <div className="flex gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 hover:text-blue-900"
                >
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
} 