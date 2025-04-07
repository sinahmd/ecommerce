import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Blog Post | Admin Dashboard',
  description: 'Edit an existing blog post.',
};

export default function EditBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 