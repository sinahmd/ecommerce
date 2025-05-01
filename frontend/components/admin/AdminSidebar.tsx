'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import { useEffect } from 'react';
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  TagIcon,
  CogIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'داشبورد', href: '/admin', icon: HomeIcon },
  { name: 'محصولات', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: TagIcon },
  { name: 'وبلاگ', href: '/admin/blog', icon: DocumentTextIcon },
  { name: 'کاربران', href: '/admin/users', icon: UsersIcon },
  { name: 'تحلیل‌ها', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'تنظیمات', href: '/admin/settings', icon: CogIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  // Debug admin status
  useEffect(() => {
    if (user) {
      console.log("AdminSidebar - User:", { role: user.role, isAdmin: user.role === 'admin' });
    } else {
      console.log("AdminSidebar - No user");
    }
  }, [user]);

  return (
    <div className="w-64 bg-white shadow-lg" dir="rtl">
      <div className="flex h-16 items-center justify-center border-b">
        <h1 className="text-xl font-bold text-gray-800">پنل مدیریت</h1>
      </div>
      <nav className="mt-5 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`ml-4 h-6 w-6 flex-shrink-0 ${
                  isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
