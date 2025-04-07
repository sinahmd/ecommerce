import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Blog | Admin Dashboard',
  description: 'Create, edit, and manage your blog posts.',
};

export default function BlogAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 