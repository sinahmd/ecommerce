import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Blog Post | Admin Dashboard',
  description: 'Create a new blog post.',
};

export default function CreateBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 