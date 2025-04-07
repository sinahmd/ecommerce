import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/blog-service';
import { BlogPostForm } from '../../components/blog-post-form';

export default async function EditBlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  let post;
  
  try {
    post = await getBlogPost(params.slug);
  } catch (error) {
    console.error(`Failed to fetch blog post with slug: ${params.slug}`, error);
    return notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      <BlogPostForm post={post} />
    </div>
  );
} 