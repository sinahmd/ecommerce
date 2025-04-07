import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  title: string;
  link: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  // Create schema.org BreadcrumbList structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@id': `${process.env.NEXT_PUBLIC_SITE_URL}${item.link}`,
        'name': item.title
      }
    }))
  };

  return (
    <>
      {/* Add schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <nav className={`flex items-center text-sm mb-6 ${className}`}>
        <ol className="flex flex-wrap items-center space-x-2">
          {items.map((item, index) => (
            <li key={item.link} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              )}
              
              {item.isCurrentPage ? (
                <span className="font-medium text-gray-700" aria-current="page">
                  {item.title}
                </span>
              ) : (
                <Link
                  href={item.link}
                  className="text-gray-500 hover:text-gray-700 hover:underline"
                >
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
} 