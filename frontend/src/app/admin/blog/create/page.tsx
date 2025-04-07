import { BlogPostForm } from '../components/blog-post-form';

export default function CreateBlogPostPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Blog Post</h1>
      <BlogPostForm />
    </div>
  );
} 