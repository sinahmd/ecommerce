'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import slugify from 'slugify';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogPost, Tag, createBlogPost, getTags, updateBlogPost } from '@/lib/blog-service';

// Define the RichTextEditor props type to match the imported component
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Dynamically import the editor to avoid SSR issues
const RichTextEditor = dynamic<RichTextEditorProps>(
  () => import('@/app/admin/blog/components/rich-text-editor'), 
  { ssr: false }
);

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  cover_image: z.any().optional(),
  tags: z.array(z.number()).default([]),
  meta_title: z.string().max(100).optional(),
  meta_description: z.string().max(160).optional(),
  canonical_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface BlogPostFormProps {
  post?: BlogPost;
}

// For type safety
// const useForm = ReactHookForm.useForm;

export function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    post?.tags?.map(tag => tag.id) || []
  );
  const [imagePreview, setImagePreview] = useState<string | null>(post?.cover_image || null);
  const [formError, setFormError] = useState<string | null>(null);
  
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      content: post?.content || '',
      excerpt: post?.excerpt || '',
      tags: post?.tags?.map(tag => tag.id) || [],
      meta_title: post?.meta_title || '',
      meta_description: post?.meta_description || '',
      canonical_url: post?.canonical_url || '',
      is_published: post?.is_published || false,
    },
  });

  const watchTitle = form.watch('title');
  const watchContent = form.watch('content');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !post) {
      // Use slugify for proper URL slug generation
      const generatedSlug = slugify(watchTitle, { lower: true, strict: true });
      form.setValue('slug', generatedSlug);
    }
  }, [watchTitle, form, post]);

  // Fetch available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    
    loadTags();
  }, []);
  
  // Handle tag selection
  const handleTagChange = (tagId: number, checked: boolean) => {
    let newSelectedTags: number[];
    
    if (checked) {
      // Add the tag if it's checked and not already selected
      newSelectedTags = [...selectedTagIds, tagId].filter(
        (id, index, self) => self.indexOf(id) === index
      );
    } else {
      // Remove the tag if it's unchecked
      newSelectedTags = selectedTagIds.filter(id => id !== tagId);
    }
    
    setSelectedTagIds(newSelectedTags);
    form.setValue('tags', newSelectedTags);
  };
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Store the file in the form
      form.setValue('cover_image', file);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Create an object with the form values but don't include tags yet
      const blogPostData: Partial<BlogPost> = {
        title: values.title,
        slug: values.slug,
        content: values.content,
        excerpt: values.excerpt,
        cover_image: values.cover_image,
        meta_title: values.meta_title,
        meta_description: values.meta_description,
        canonical_url: values.canonical_url,
        is_published: values.is_published
      };

      // Add tags as Tag objects
      if (values.tags && values.tags.length > 0) {
        blogPostData.tags = values.tags.map(id => {
          const tag = availableTags.find(t => t.id === id);
          return tag || { id, name: '', slug: '' };
        });
      }
      
      if (post) {
        // Update existing post
        await updateBlogPost(post.slug, blogPostData);
      } else {
        // Create new post
        await createBlogPost(blogPostData);
      }
      
      router.push('/admin/blog');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error saving blog post:', error);
      
      // Type guard for axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status: number; 
            data: Record<string, unknown>; 
          } 
        };
        
        if (axiosError.response) {
          const statusCode = axiosError.response.status;
          const data = axiosError.response.data;
          
          if (statusCode === 405) {
            setFormError("Method not allowed. The server doesn't accept this type of request.");
          } else if (statusCode === 400 && data) {
            // Format validation errors
            const errorMessages = Object.entries(data)
              .map(([field, messages]) => `${field}: ${messages}`)
              .join(', ');
            setFormError(`Validation error: ${errorMessages}`);
          } else {
            setFormError(`Error (${statusCode}): ${data?.detail || 'Something went wrong'}`);
          }
        }
      } else {
        setFormError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {formError}
          </div>
        )}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Content tab */}
              <TabsContent value="content" className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="post-url-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly version of the title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief summary of the post" 
                          {...field} 
                          value={field.value || ''} 
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        A short summary displayed on blog cards and in search results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cover_image"
                  render={() => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange}
                        />
                      </FormControl>
                      {imagePreview && (
                        <div className="mt-2 relative w-full h-40">
                          <img 
                            src={imagePreview} 
                            alt="Cover preview" 
                            className="rounded-md object-cover max-h-full" 
                          />
                        </div>
                      )}
                      <FormDescription>
                        Featured image for the blog post
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
                          {availableTags.map(tag => (
                            <div key={tag.id} className="flex items-center space-x-2 py-1">
                              <Checkbox 
                                id={`tag-${tag.id}`} 
                                checked={selectedTagIds.includes(tag.id)}
                                onCheckedChange={(checked) => 
                                  handleTagChange(tag.id, checked === true)
                                }
                              />
                              <FormLabel 
                                htmlFor={`tag-${tag.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {tag.name}
                              </FormLabel>
                            </div>
                          ))}
                          {availableTags.length === 0 && (
                            <div className="text-center py-2 text-sm text-gray-500">
                              No tags available
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Categorize your post with relevant tags
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Publish
                        </FormLabel>
                        <FormDescription>
                          Toggle to publish or save as draft
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* SEO tab */}
              <TabsContent value="seo" className="space-y-6">
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SEO title" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Title used in search results and social shares (max 100 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="SEO description" 
                          {...field} 
                          value={field.value || ''}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        Description used in search results and social shares (max 160 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="canonical_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canonical URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/original-url" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Set this if the content is duplicated from another source
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Preview tab */}
              <TabsContent value="preview">
                <div className="rounded-md border p-6">
                  <h1 className="text-3xl font-bold mb-4">{watchTitle || 'Post Title'}</h1>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: watchContent || 'Post content preview...' }} />
                  </div>
                </div>
              </TabsContent>
              
              <div className="flex justify-end gap-4">
                <Link href="/admin/blog">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
} 