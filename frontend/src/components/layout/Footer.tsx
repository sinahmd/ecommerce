import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background" dir="rtl">
      <div className="container py-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">فروشگاه</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              فروشگاه یکپارچه برای جدیدترین مدهای لباس و لوازم جانبی.
            </p>
            <div className="mt-4 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">فیسبوک</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">اینستاگرام</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">توییتر</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">فروشگاه</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  همه محصولات
                </Link>
              </li>
              <li>
                <Link href="/category/clothing" className="text-muted-foreground hover:text-foreground">
                  پوشاک
                </Link>
              </li>
              <li>
                <Link href="/category/accessories" className="text-muted-foreground hover:text-foreground">
                  لوازم جانبی
                </Link>
              </li>
              <li>
                <Link href="/category/shoes" className="text-muted-foreground hover:text-foreground">
                  کفش
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">حساب کاربری</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/account" className="text-muted-foreground hover:text-foreground">
                  حساب من
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-muted-foreground hover:text-foreground">
                  سفارش‌های من
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-muted-foreground hover:text-foreground">
                  لیست علاقه‌مندی
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">راهنما</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  سوالات متداول
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground">
                  ارسال و مرجوعی
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  درباره ما
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} فروشگاه. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
} 