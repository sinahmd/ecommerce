'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Pencil, Trash2, Eye, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';


import { getBlogPosts, BlogPost } from '@/lib/blog-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const data = await getBlogPosts();
        setPosts(data?.posts ?? []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);
  
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <p className="text-gray-500">Create, edit, and manage your blog posts.</p>
      </header>

      {/* <div className="mb-8">
        <BlogAuthTest />
      </div> */}
      
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/blog/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500 bg-red-50 rounded">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-md shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No blog posts found. Create your first post!
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      {post.is_published ? (
                        <Badge className="bg-green-500">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge variant="secondary" key={tag.id} className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {format(new Date(post.updated_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/edit/${post.slug}`}>
                          <Button size="sm" variant="outline">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/delete/${post.slug}`}>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 