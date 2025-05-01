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
        setError('خطا در بارگیری پست‌های وبلاگ');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);
  
  return (
    <div className="p-6" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">مدیریت وبلاگ</h1>
        <p className="text-gray-500">ایجاد، ویرایش و مدیریت پست‌های وبلاگ.</p>
      </header>

      {/* <div className="mb-8">
        <BlogAuthTest />
      </div> */}
      
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/blog/create">
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            ایجاد پست جدید
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
                <TableHead>عنوان</TableHead>
                <TableHead>منتشر شده</TableHead>
                <TableHead>برچسب‌ها</TableHead>
                <TableHead>تاریخ ایجاد</TableHead>
                <TableHead>تاریخ بروزرسانی</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    هیچ پست وبلاگی یافت نشد. اولین پست خود را ایجاد کنید!
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      {post.title}
                    </TableCell>
                    <TableCell>
                      {post.is_published ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          منتشر شده
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-800">
                          پیش‌نویس
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.tags && post.tags.length > 0 ? post.tags.map((tag) => (
                          <Badge key={String(tag)} variant="secondary" className="text-xs">
                            {String(tag)}
                          </Badge>
                        )) : null}
                        {(!post.tags || post.tags.length === 0) && (
                          <span className="text-gray-400 text-xs">بدون برچسب</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.created_at ? format(new Date(post.created_at), 'yyyy/MM/dd') : ''}
                    </TableCell>
                    <TableCell>
                      {post.updated_at ? format(new Date(post.updated_at), 'yyyy/MM/dd') : ''}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex justify-start gap-2">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">پیش‌نمایش</span>
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/edit/${post.slug}`}>
                          <Button size="sm" variant="outline">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">ویرایش</span>
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/delete/${post.slug}`}>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">حذف</span>
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