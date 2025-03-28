import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { ChevronLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-sm mb-6">
          <Link 
            href="/" 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to store
          </Link>
        </div>
        
        <div className="bg-background border rounded-lg shadow-sm p-6 md:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
} 