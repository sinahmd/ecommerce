import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/blog-service';
import { Button } from '@/components/ui/button';
import DeleteBlogPostForm from '@/app/admin/blog/components/delete-blog-post-form';

export const metadata: Metadata = {
  title: 'Delete Blog Post | Admin Dashboard',
};

export default async function DeleteBlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  let post;
  
  try {
    post = await getBlogPost(params.slug);
  } catch (error) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Delete Blog Post</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl">
        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete this blog post? This action cannot be undone.
        </p>
        
        <div className="flex gap-4">
          <DeleteBlogPostForm slug={post.slug} />
          <Link href="/admin/blog">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 