'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteBlogPost } from '@/lib/blog-service';

interface DeleteBlogPostFormProps {
  slug: string;
}

export default function DeleteBlogPostForm({ slug }: DeleteBlogPostFormProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBlogPost(slug);
      router.push('/admin/blog');
      router.refresh();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
} 