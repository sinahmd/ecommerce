"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, Search, User, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCartContext } from '@/providers/CartProvider';
import { useCategories } from '@/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { cart } = useCartContext();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const totalItems = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            Store
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </Link>
            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Link */}
          <Link href="/search">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart Link */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Account Menu */}
          {user ? (
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
                <DropdownMenuItem asChild>
                  <Link href="/orders">My Orders</Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative w-full">
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pr-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </form>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-4">
                  <Link 
                    href="/products" 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Products
                  </Link>
                  {user ? (
                    <>
                      <Link 
                        href="/profile" 
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link 
                        href="/orders" 
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        My Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link 
                      href="/login" 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Login
                    </Link>
                  )}
                  {categories?.map((category) => (
                    <Link 
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 