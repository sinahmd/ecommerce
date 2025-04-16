"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SearchBox } from '@/components/ui/search-box';
import { useCartContext } from '@/providers/CartProvider';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, ChevronDown, UserCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCategories } from '@/hooks/useProducts';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItemsCount } = useCartContext();
  const { user, logout } = useAuth();
  const { categories, isLoading: categoriesLoading } = useCategories({ immediate: true });
  const [mounted, setMounted] = useState(false);

  // Handle client-side hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (!mounted) return false;
    return pathname === path;
  };

  const isCategoryActive = (categorySlug: string) => {
    if (!mounted) return false;
    return pathname === `/category/${categorySlug}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/products');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const mainNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center">
        <div className="hidden md:flex md:gap-x-6 md:items-center">
          <Link href="/" className="text-xl font-bold">
            Store
          </Link>
          
          {mainNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                isActive(item.href) ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`text-sm font-medium transition-colors hover:text-foreground/80 flex items-center gap-1 px-0 h-auto py-0 ${
                  pathname.startsWith('/category/') ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                Categories <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {categoriesLoading ? (
                <DropdownMenuItem disabled>Loading categories...</DropdownMenuItem>
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link 
                      href={`/category/${category.slug}`}
                      className={isCategoryActive(category.slug) ? 'bg-muted' : ''}
                    >
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-lg font-medium ${
                    isActive(item.href) ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="text-lg font-medium">Categories</div>
              <div className="pl-4 flex flex-col gap-2">
                {!mounted || categoriesLoading ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className={`text-sm font-medium ${
                        isCategoryActive(category.slug) ? 'text-foreground' : 'text-foreground/60'
                      }`}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No categories available</div>
                )}
              </div>
              
              {/* Mobile Account Links */}
              {mounted && user && (
                <>
                  <div className="text-lg font-medium">Account</div>
                  <div className="pl-4 flex flex-col gap-2">
                    <Link 
                      href="/profile" 
                      className={`text-sm font-medium ${
                        isActive('/profile') ? 'text-foreground' : 'text-foreground/60'
                      }`}
                    >
                      My Profile
                    </Link>     
                    {user.role === 'admin' && (
                      <Link 
                        href="/admin"
                        className={`text-sm font-medium ${
                          pathname.startsWith('/admin') ? 'text-foreground' : 'text-foreground/60'
                        }`}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-foreground/60 hover:text-foreground text-left"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center gap-4">
          <SearchBox
            placeholder="Search products..."
            className="w-full max-w-[200px] lg:max-w-[300px]"
          />

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>

          {mounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                
               
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
} 